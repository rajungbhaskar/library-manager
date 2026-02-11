import { Book, Author, ReadingStatus } from '../types';

export const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500 KB
export const MAX_AUTHOR_IMAGE_SIZE_BYTES = 200 * 1024; // 200 KB

export const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true; // Optional dates are valid if empty
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

export const isFutureDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date > new Date();
};

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateImage = (base64String?: string, maxSizeBytes: number = MAX_IMAGE_SIZE_BYTES): boolean => {
    if (!base64String) return true;

    // Check for base64 data URL format
    if (!base64String.startsWith('data:image/')) {
        console.warn('Validation Failed: Image is not a valid data URL.');
        return false;
    }

    // Check MIME type
    const mimeMatch = base64String.match(/^data:(image\/[a-zA-Z]+);base64,/);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.includes(mimeMatch[1])) {
        console.warn(`Validation Failed: Image MIME type ${mimeMatch ? mimeMatch[1] : 'unknown'} is not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
        return false;
    }

    // Check size (approximate)
    // Base64 string length * 0.75 is roughly the file size in bytes
    const sizeInBytes = base64String.length * 0.75;
    if (sizeInBytes > maxSizeBytes) {
        console.warn(`Validation Failed: Image size (${Math.round(sizeInBytes / 1024)}KB) exceeds limit of ${Math.round(maxSizeBytes / 1024)}KB.`);
        return false;
    }

    return true;
};

export const validateImageContent = (base64String: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!base64String) {
            resolve(true);
            return;
        }

        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => {
            console.warn('Validation Failed: Image could not be decoded by the browser.');
            resolve(false);
        };
        img.src = base64String;
    });
};

export const validateAuthor = (author: Author): boolean => {
    if (!author) return false;

    // Name validation
    if (!author.name || typeof author.name !== 'string' || author.name.trim().length === 0) {
        console.warn(`Validation Failed: Author ${author.id || '?'} has invalid name.`);
        return false;
    }

    // Image validation
    // Soft Guardrail: Validation moved to storageService sanitization
    /*
    if (author.photo && !validateImage(author.photo)) {
        return false;
    }
    */

    return true;
};

export const validateBook = (book: Book, availableAuthors: string[] = []): boolean => {
    if (!book) return false;

    // ID
    if (!book.id || typeof book.id !== 'string') {
        console.warn('Validation Failed: Book missing ID.');
        return false;
    }

    // Title
    if (!book.title || typeof book.title !== 'string' || book.title.trim().length === 0) {
        console.warn(`Validation Failed: Book ${book.id} has invalid title.`);
        return false;
    }

    // Author
    if (!book.author || typeof book.author !== 'string' || book.author.trim().length === 0) {
        console.warn(`Validation Failed: Book ${book.id} ("${book.title}") has invalid author.`);
        return false;
    }

    // Language
    if (!book.language || typeof book.language !== 'string' || book.language.trim().length === 0) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid language.`);
        return false;
    }

    // Publisher
    if (!book.publisher || typeof book.publisher !== 'string' || book.publisher.trim().length === 0) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid publisher.`);
        return false;
    }

    // Author existence check (if list provided)
    if (availableAuthors.length > 0 && !availableAuthors.includes(book.author)) {
        console.warn(`Validation Failed: Book "${book.title}" references unknown author "${book.author}".`);
        // Requirement: "author ... must exist".
        // During load, if author is missing, maybe we should still load the book but warn?
        // Or strictly reject? "Prevent invalid... from being loaded".
        // Safe Load Guard: "Validate structure... log warning and ignore invalid entries".
        // So if author is missing from the list, we ignore the book.
        return false;
    }

    // Pages & Price
    if (typeof book.pages !== 'number' || book.pages <= 0) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid pages: ${book.pages}`);
        return false;
    }
    // Price must be > 0 unless gifted
    if (!book.isGifted && (typeof book.price !== 'number' || book.price <= 0)) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid price: ${book.price}`);
        return false;
    }
    // Gifted books can have 0 price, but shouldn't be negative
    if (book.isGifted && (typeof book.price === 'number' && book.price < 0)) {
        console.warn(`Validation Failed: Book "${book.title}" has negative price: ${book.price}`);
        return false;
    }

    // Dates
    if (book.purchaseDate && !isValidDate(book.purchaseDate)) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid purchaseDate.`);
        return false;
    }
    if (book.publishDate) {
        if (!isValidDate(book.publishDate)) {
            console.warn(`Validation Failed: Book "${book.title}" has invalid publishDate.`);
            return false;
        }

        // Future date check applies to BOTH full dates matches and Year Only matches
        // If Year Only (e.g. "2050"), isValidDate("2050") works (treated as Jan 1 2050).
        // isFutureDate uses new Date() > new Date(str). 
        // We want to block future dates.
        if (isFutureDate(book.publishDate)) {
            console.warn(`Validation Failed: Book "${book.title}" has publishDate in the future.`);
            return false;
        }
    }

    // Reading Status
    const validStatuses: ReadingStatus[] = ['To Read', 'Reading', 'Completed', 'Dropped'];
    if (!validStatuses.includes(book.status)) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid status: ${book.status}`);
        return false;
    }

    // Cover Image
    // We do NOT return false here for invalid images anymore (Soft Guardrail).
    // The storage service will validate and strip invalid images before saving.
    // This allows the book to be saved even if the image is bad (image is dropped).
    /*
    if (book.coverImage && !validateImage(book.coverImage)) {
        console.warn(`Validation Failed: Book "${book.title}" has invalid cover image.`);
        return false;
    }
    */

    return true;
};
