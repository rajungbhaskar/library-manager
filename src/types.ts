export type ReadingStatus = 'Reading' | 'Completed' | 'To Read' | 'Dropped';

export interface Book {
    id: string;
    title: string;
    author: string;
    language: string;
    pages: number;
    publisher: string;
    purchaseDate: string; // YYYY-MM-DD
    publishDate: string;  // YYYY-MM-DD
    publishYearOnly?: boolean;
    coverImage?: string;
    price: number;
    status: ReadingStatus;
    startDate?: string;       // YYYY-MM-DD
    completionDate?: string;  // YYYY-MM-DD
    notes?: string;
    currentPage?: number;
    rating?: number;          // 1-5
    isGifted?: boolean;
}

export interface Author {
    id: string;
    name: string;
    photo?: string; // Base64 string
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Optional because we might not want to expose it in the UI context eventually
    createdAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}
