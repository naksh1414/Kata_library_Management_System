import { Book } from './book.js';

export class Library {
    constructor() {
        this.books = new Map();
    }

    addBook(isbn, title, author, publicationYear) {
        // Validate inputs
        if (!isbn || !title || !author || !publicationYear) {
            throw new Error('All book details are required');
        }

        // Validate year
        const currentYear = new Date().getFullYear();
        if (publicationYear < 1900 || publicationYear > currentYear) {
            throw new Error('Invalid publication year');
        }

        // Check for duplicate ISBN
        if (this.books.has(isbn)) {
            throw new Error('Book with this ISBN already exists');
        }

        const book = new Book(isbn, title, author, publicationYear);
        this.books.set(isbn, book);
        return book;
    }

    borrowBook(isbn) {
        const book = this.books.get(isbn);
        
        if (!book) {
            throw new Error('Book not found');
        }
        
        if (!book.isAvailable) {
            throw new Error('Book is not available');
        }

        book.isAvailable = false;
        return book;
    }

    returnBook(isbn) {
        const book = this.books.get(isbn);
        
        if (!book) {
            throw new Error('Book not found');
        }

        if (book.isAvailable) {
            throw new Error('Book is already in library');
        }

        book.isAvailable = true;
        return book;
    }

    getAvailableBooks() {
        return Array.from(this.books.values())
            .filter(book => book.isAvailable);
    }

    searchBooks(query) {
        if (!query) return [];
        
        const searchTerm = query.toLowerCase();
        return Array.from(this.books.values())
            .filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.isbn.toLowerCase().includes(searchTerm) ||
                book.publicationYear.toString().includes(searchTerm)
            );
    }
}