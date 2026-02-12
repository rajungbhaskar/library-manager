import { get, set } from 'idb-keyval';
import { Book, Author } from '../types';
import { validateBook, validateAuthor, validateImage, validateImageContent, MAX_AUTHOR_IMAGE_SIZE_BYTES } from '../utils/validators';

const DEFAULT_STORAGE_KEY = 'my-shelf-data';

export interface StorageData {
    books: Book[];
    authors: Author[];
    languages: string[];
    publishers: string[];
    settings: {
        currency: string;
    };
}

const STORAGE_VERSION = 1;

interface PersistedData {
    version: number;
    data: StorageData;
}

const defaultData: StorageData = {
    books: [],
    authors: [],
    languages: [],
    publishers: [],
    settings: {
        currency: '$',
    },
};

const sanitizeDataAsync = async (data: StorageData): Promise<StorageData> => {
    // 1. Sanitize Authors
    const validAuthors: Author[] = [];

    for (const a of data.authors) {
        // Create shallow copy
        const authorCopy = { ...a };

        const isValid = validateAuthor(authorCopy);
        if (!isValid) {
            console.warn(`Skipping invalid author: ${authorCopy.name}`);
            continue;
        }

        // Robust Author Image Validation (Soft Guardrail)
        if (authorCopy.photo) {
            // 1. Sync Check (Format/Size/MIME) - use 200KB limit for authors
            // We need to import MAX_AUTHOR_IMAGE_SIZE_BYTES - let's assume it's available or use the literal if we can't easily change imports here without viewing whole file.
            // Actually I can rely on the import update separately or just use the tool capability to see imports.
            // But wait, I'm replacing lines 30-38. Imports are at top. I should check imports first or assume I can add it.
            // I will use reference to imported constant, assuming I'll update imports in next step or this tool invocation allows multi-replace if I used multi_replace.
            // Since I'm using replace_file_content (single block), I should ensure imports are correct.
            // Ah, I can't see the imports in this block.
            // However, I can use the literal 200*1024 or better, just use the constant and update imports in a separate tool call if needed.
            // Let's assume the previous step updated validators.ts so constant is exported.
            // I need to update storageService imports to include MAX_AUTHOR_IMAGE_SIZE_BYTES.

            if (!validateImage(authorCopy.photo, MAX_AUTHOR_IMAGE_SIZE_BYTES)) {
                console.warn(`Dropping invalid author image for author "${authorCopy.name}": Invalid Format or Size.`);
                authorCopy.photo = undefined;
            } else {
                // 2. Async Check (Decoding)
                const canDecode = await validateImageContent(authorCopy.photo);
                if (!canDecode) {
                    console.warn(`Dropping invalid author image for author "${authorCopy.name}": Browser failed to decode image.`);
                    authorCopy.photo = undefined;
                }
            }
        }
        validAuthors.push(authorCopy);
    }

    const authorNames = validAuthors.map(a => a.name);

    // 2. Sanitize Books
    const validBooks: Book[] = [];

    for (const b of data.books) {
        // Create a copy to avoid mutating the input directly if that matters,
        // though here we are filtering, so shallow copy is good practice if modifying.
        const bookCopy = { ...b };

        const isValid = validateBook(bookCopy, authorNames);
        if (!isValid) {
            console.warn(`Skipping invalid book: ${bookCopy.title}`);
            continue;
        }

        // Robust Cover Image Validation (Soft Guardrail)
        if (bookCopy.coverImage) {
            // 1. Sync Check (Format/Size/MIME) - validateImage now enforces allowed types & size
            if (!validateImage(bookCopy.coverImage)) {
                console.warn(`Dropping invalid cover image for book "${bookCopy.title}": Invalid Format or Size.`);
                bookCopy.coverImage = undefined;
            } else {
                // 2. Async Check (Decoding)
                const canDecode = await validateImageContent(bookCopy.coverImage);
                if (!canDecode) {
                    console.warn(`Dropping invalid cover image for book "${bookCopy.title}": Browser failed to decode image.`);
                    bookCopy.coverImage = undefined;
                }
            }
        }

        validBooks.push(bookCopy);
    }

    return {
        ...data,
        authors: validAuthors,
        books: validBooks,
        languages: Array.from(new Set(data.languages || [])).sort(), // Deduplicate and sort languages
        publishers: Array.from(new Set(data.publishers || [])).sort(), // Deduplicate and sort publishers
    };
};

export const storageService = {
    load: async (key: string = DEFAULT_STORAGE_KEY): Promise<StorageData> => {
        try {
            // 1. Check if we need to migrate from localStorage (Legacy Web Only)
            const legacy = localStorage.getItem(key);
            const stored = await get<PersistedData | StorageData>(key);

            if (!stored && legacy) {
                console.log("Migrating data from localStorage to IDB (Legacy -> V1)...");
                try {
                    const parsedLegacy = JSON.parse(legacy);
                    if (parsedLegacy && (parsedLegacy.books || parsedLegacy.authors)) {
                        const migratedData: StorageData = {
                            ...defaultData,
                            ...parsedLegacy,
                            books: parsedLegacy.books || [],
                            authors: parsedLegacy.authors || []
                        };

                        const sanitized = await sanitizeDataAsync(migratedData);

                        // Save immediately to IDB with version
                        await set(key, {
                            version: STORAGE_VERSION,
                            data: sanitized
                        });

                        return sanitized;
                    }
                } catch (e) {
                    console.error("Failed to migrate legacy localStorage data", e);
                }
            }

            if (!stored) return defaultData;

            // 2. Check Version
            // Type guard to check if it's the versioned wrapper
            let dataToLoad: StorageData = defaultData;

            if ('version' in stored && 'data' in stored) {
                const persisted = stored as PersistedData;

                if (persisted.version > STORAGE_VERSION) {
                    console.warn(`Data version mismatch! Storage has version ${persisted.version}, app supports ${STORAGE_VERSION}. Loading data safely but be careful saving.`);
                    dataToLoad = persisted.data;
                } else {
                    dataToLoad = { ...defaultData, ...persisted.data };
                }
            } else {
                // 3. Handle Legacy IDB Data (Unversioned but in IDB)
                console.log("Migrating IDB data (V0 -> V1)...");
                const legacyStored = stored as StorageData;
                const migratedData: StorageData = {
                    ...defaultData,
                    ...legacyStored,
                    books: legacyStored.books || [],
                    authors: legacyStored.authors || []
                };

                // We will save the sanitized version below, just set it as current
                dataToLoad = migratedData;
            }

            // Always sanitize before returning to app
            return await sanitizeDataAsync(dataToLoad);

        } catch (error) {
            console.error('Failed to load data from storage:', error);
            return defaultData;
        }
    },

    save: async (data: Partial<StorageData>, key: string = DEFAULT_STORAGE_KEY) => {
        try {
            const stored = await get<PersistedData | StorageData>(key);
            let current: StorageData;

            if (stored && 'version' in stored && 'data' in stored) {
                current = stored.data;
            } else {
                current = (stored as StorageData) || defaultData;
            }

            const newData = { ...current, ...data };

            // Validate before saving
            // We use the same sanitize function, which will drop invalid items
            // Ideally the UI/Context shouldn't send bad data, but this is the final guardrail.
            const sanitized = await sanitizeDataAsync(newData);

            await set(key, {
                version: STORAGE_VERSION,
                data: sanitized
            });
        } catch (error) {
            console.error('Failed to save data to storage:', error);
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                console.warn('Storage Limit Reached! Use smaller images or delete books.');
            }
        }
    },

    replace: async (data: StorageData, key: string = DEFAULT_STORAGE_KEY) => {
        try {
            const sanitized = await sanitizeDataAsync(data);
            await set(key, {
                version: STORAGE_VERSION,
                data: sanitized
            });
        } catch (error) {
            console.error('Failed to replace data in storage:', error);
            throw error;
        }
    }
};
