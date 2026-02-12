import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageService';
import { Book, Author } from '../types';
import { validateBook } from '../utils/validators';
import { useAuth } from './AuthContext';

export type AuthorSortOrder = 'asc' | 'desc' | 'none';

interface LibraryContextType {
    books: Book[];
    authors: Author[];
    addBook: (book: Omit<Book, 'id'>) => void;
    updateBook: (id: string, updatedBook: Partial<Book>) => void;
    deleteBook: (id: string) => void;
    addAuthor: (name: string, photo?: string) => void;
    updateAuthor: (id: string, name: string, photo?: string) => void;
    deleteAuthor: (id: string) => void;
    loading: boolean;
    authorSortOrder: AuthorSortOrder;
    setAuthorSortOrder: (order: AuthorSortOrder) => void;
    checkOrphans: () => string[];
    reassignBooks: (oldName: string, newName: string) => void;
    languages: string[];
    addLanguage: (lang: string) => void;
    deleteLanguage: (lang: string) => void;
    publishers: string[];
    addPublisher: (pub: string) => void;
    deletePublisher: (pub: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return context;
};

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const storageKey = useMemo(() => user ? `library-data-${user.id}` : 'library-data-guest', [user]);

    const [books, setBooks] = React.useState<Book[]>([]);
    const [authors, setAuthors] = React.useState<Author[]>([]);
    const [languages, setLanguages] = React.useState<string[]>([]);
    const [publishers, setPublishers] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [authorSortOrder, setAuthorSortOrder] = React.useState<AuthorSortOrder>('asc');

    // Sort authors derived state
    const sortedAuthors = useMemo(() => {
        if (authorSortOrder === 'none') return authors;

        return [...authors].sort((a, b) => {
            if (authorSortOrder === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
    }, [authors, authorSortOrder]);


    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await storageService.load(storageKey);
                setBooks(data.books);
                setAuthors(data.authors);
                setLanguages(data.languages || []);
                setPublishers(data.publishers || []);
            } catch (error) {
                console.error("Failed to load library data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [storageKey]);

    const saveBooks = async (newBooks: Book[]) => {
        setBooks(newBooks);
        await storageService.save({ books: newBooks }, storageKey);
    };

    const saveAuthors = async (newAuthors: Author[]) => {
        setAuthors(newAuthors);
        await storageService.save({ authors: newAuthors }, storageKey);
    };

    const saveLanguages = async (newLanguages: string[]) => {
        setLanguages(newLanguages);
        await storageService.save({ languages: newLanguages }, storageKey);
    };

    const savePublishers = async (newPublishers: string[]) => {
        setPublishers(newPublishers);
        await storageService.save({ publishers: newPublishers }, storageKey);
    };

    const addBook = (bookData: Omit<Book, 'id'>) => {
        const newBook: Book = { ...bookData, id: uuidv4() };

        // Validation Guard
        if (!validateBook(newBook, authors.map(a => a.name))) {
            const msg = "Cannot add book: Validation failed (check console for details).";
            alert(msg); // Alert allowed here as user interaction feedback? User asked for warnings.
            return;
        }

        saveBooks([...books, newBook]);
    };

    const updateBook = (id: string, updatedBook: Partial<Book>) => {
        // Construct the potential new book object to validate it
        const currentBook = books.find(b => b.id === id);
        if (!currentBook) return;

        const newBookState = { ...currentBook, ...updatedBook };

        // Validation Guard
        if (!validateBook(newBookState, authors.map(a => a.name))) {
            const msg = "Cannot update book: Validation failed (check console for details).";
            alert(msg);
            return;
        }

        const newBooks = books.map(book => (book.id === id ? newBookState : book));
        saveBooks(newBooks);
    };

    const deleteBook = (id: string) => {
        const newBooks = books.filter(book => book.id !== id);
        saveBooks(newBooks);
    };

    const addAuthor = (name: string, photo?: string) => {
        // Prevent duplicate names
        if (authors.some(a => a.name.toLowerCase() === name.toLowerCase())) return;

        const newAuthor: Author = { id: uuidv4(), name, photo };
        saveAuthors([...authors, newAuthor]);
    };

    const updateAuthor = (id: string, name: string, photo?: string) => {
        // Find the old author data to see if the name changed
        const oldAuthor = authors.find(a => a.id === id);

        // Update the authors list
        const newAuthors = authors.map(author => (author.id === id ? { ...author, name, photo: photo !== undefined ? photo : author.photo } : author));

        // If the name changed, we MUST update all books referencing the old name
        if (oldAuthor && oldAuthor.name !== name) {
            const newBooks = books.map(book => {
                if (book.author === oldAuthor.name) {
                    return { ...book, author: name };
                }
                return book;
            });

            // Batch save both to ensure consistency
            // Note: We duplicate the save logic slightly here to ensure atomicity in our simple storage model
            setAuthors(newAuthors);
            setBooks(newBooks);
            storageService.save({
                authors: newAuthors,
                books: newBooks
            }, storageKey);
        } else {
            // Just save authors if name didn't change (e.g. only photo updated)
            saveAuthors(newAuthors);
        }
    };

    const deleteAuthor = (id: string) => {
        const authorToDelete = authors.find(a => a.id === id);
        if (!authorToDelete) return;

        // Guardrail: Prevent deleting if referenced by books
        const isReferenced = books.some(b => b.author === authorToDelete.name);
        if (isReferenced) {
            const message = `Cannot delete author "${authorToDelete.name}" because they have books in the library.`;
            console.warn(message);
            alert(message);
            return;
        }

        const newAuthors = authors.filter(author => author.id !== id);
        saveAuthors(newAuthors);
    };

    const checkOrphans = () => {
        const authorNames = new Set(authors.map(a => a.name));
        const orphanedBooks = books.filter(b => !authorNames.has(b.author));
        // Return unique author names that are missing
        return Array.from(new Set(orphanedBooks.map(b => b.author)));
    };

    const reassignBooks = (oldName: string, newName: string) => {
        const newBooks = books.map(book => {
            if (book.author === oldName) {
                return { ...book, author: newName };
            }
            return book;
        });
        saveBooks(newBooks);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Library...</div>;
    }

    const addLanguage = (lang: string) => {
        const trimmed = lang.trim();
        if (!trimmed) return;

        // Case insensitive duplicate check
        const exists = languages.some(l => l.toLowerCase() === trimmed.toLowerCase());
        if (!exists) {
            const newLanguages = [...languages, trimmed].sort();
            saveLanguages(newLanguages);
        }
    };

    const deleteLanguage = (lang: string) => {
        const newLanguages = languages.filter(l => l !== lang);
        saveLanguages(newLanguages);
    };

    const addPublisher = (pub: string) => {
        const trimmed = pub.trim();
        if (!trimmed) return;
        const exists = publishers.some(p => p.toLowerCase() === trimmed.toLowerCase());
        if (!exists) {
            const newPublishers = [...publishers, trimmed].sort();
            savePublishers(newPublishers);
        }
    };

    const deletePublisher = (pub: string) => {
        const newPublishers = publishers.filter(p => p !== pub);
        savePublishers(newPublishers);
    };

    return (
        <LibraryContext.Provider value={{
            books,
            authors: sortedAuthors, // Expose sorted authors directly
            addBook,
            updateBook,
            deleteBook,
            addAuthor,
            updateAuthor,
            deleteAuthor,
            loading,
            authorSortOrder,
            setAuthorSortOrder,
            checkOrphans,
            reassignBooks,
            languages,
            addLanguage,
            deleteLanguage,
            publishers,
            addPublisher,
            deletePublisher
        }}>
            {children}
        </LibraryContext.Provider>
    );
};
