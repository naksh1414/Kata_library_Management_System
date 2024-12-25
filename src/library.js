import { Book } from "./book.js";
export class Library {
  constructor() {
    this.books = new Map();
    this.borrowHistory = new Map();
    this.categories = new Map();
    this.performanceMetrics = {
      startTime: Date.now(),
      operations: 0,
      lastOptimization: Date.now(),
    };
  }

  addBook(isbn, title, author, publicationYear) {
    this.performanceMetrics.operations++;

    if (!isbn || !title || !author || !publicationYear) {
      throw new Error("All book details are required");
    }

    const currentYear = new Date().getFullYear();
    if (publicationYear < 1900 || publicationYear > currentYear) {
      throw new Error("Invalid publication year");
    }

    if (this.books.has(isbn)) {
      throw new Error("Book with this ISBN already exists");
    }

    const book = new Book(isbn, title, author, publicationYear);
    this.books.set(isbn, book);
    return book;
  }

  addBookWithCategory(isbn, title, author, year, category) {
    const book = this.addBook(isbn, title, author, year);
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(isbn);
    return book;
  }

  borrowBook(isbn, userId = "anonymous") {
    this.performanceMetrics.operations++;
    const book = this.books.get(isbn);

    if (!book) {
      throw new Error("Book not found");
    }
    if (!book.isAvailable) {
      throw new Error("Book is not available");
    }

    book.isAvailable = false;

    if (!this.borrowHistory.has(userId)) {
      this.borrowHistory.set(userId, []);
    }

    this.borrowHistory.get(userId).push({
      isbn,
      action: "borrow",
      timestamp: new Date(),
    });

    return book;
  }

  returnBook(isbn, userId = "anonymous") {
    this.performanceMetrics.operations++;
    const book = this.books.get(isbn);

    if (!book) {
      throw new Error("Book not found");
    }
    if (book.isAvailable) {
      throw new Error("Book is already in library");
    }

    book.isAvailable = true;

    if (this.borrowHistory.has(userId)) {
      this.borrowHistory.get(userId).push({
        isbn,
        action: "return",
        timestamp: new Date(),
      });
    }

    return book;
  }

  deleteBook(isbn) {
    this.performanceMetrics.operations++;
    const book = this.books.get(isbn);

    if (!book) {
      throw new Error("Book not found");
    }
    if (!book.isAvailable) {
      throw new Error("Cannot delete borrowed book");
    }

    // Remove from categories
    this.categories.forEach((categoryBooks) => {
      categoryBooks.delete(isbn);
    });

    return this.books.delete(isbn);
  }

  getAvailableBooks() {
    this.performanceMetrics.operations++;
    return Array.from(this.books.values()).filter((book) => book.isAvailable);
  }

  searchBooks(query) {
    this.performanceMetrics.operations++;
    if (!query) return [];

    const searchTerm = query.toLowerCase();
    return Array.from(this.books.values()).filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.toLowerCase().includes(searchTerm) ||
        book.publicationYear.toString().includes(searchTerm)
    );
  }

  getBooksByCategory(category) {
    const bookIds = this.categories.get(category) || new Set();
    return Array.from(bookIds)
      .map((isbn) => this.books.get(isbn))
      .filter((book) => book !== undefined);
  }

  getUserHistory(userId) {
    return this.borrowHistory.get(userId) || [];
  }

  exportToJSON() {
    return JSON.stringify({
      books: Array.from(this.books.entries()),
      categories: Array.from(this.categories.entries()),
      borrowHistory: Array.from(this.borrowHistory.entries()),
    });
  }

  importFromJSON(jsonData) {
    const data = JSON.parse(jsonData);
    this.books = new Map(data.books);
    this.categories = new Map(data.categories);
    this.borrowHistory = new Map(data.borrowHistory);
    return true;
  }

  getBorrowingStats() {
    const stats = {
      totalBorrows: 0,
      activeLoans: 0,
      popularBooks: new Map(),
      averageLoanDuration: 0,
    };

    this.borrowHistory.forEach((history) => {
      history.forEach((record) => {
        if (record.action === "borrow") {
          stats.totalBorrows++;
          const count = stats.popularBooks.get(record.isbn) || 0;
          stats.popularBooks.set(record.isbn, count + 1);
        }
      });
    });

    stats.activeLoans = Array.from(this.books.values()).filter(
      (book) => !book.isAvailable
    ).length;

    return stats;
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      uptime: Date.now() - this.performanceMetrics.startTime,
      operationsPerSecond:
        this.performanceMetrics.operations /
        ((Date.now() - this.performanceMetrics.startTime) / 1000),
    };
  }

  optimizePerformance() {
    const now = Date.now();
    if (now - this.performanceMetrics.lastOptimization > 3600000) {
      // 1 hour
      // Clear old history entries
      this.borrowHistory.forEach((history, userId) => {
        const recentHistory = history.filter(
          (record) => now - record.timestamp < 31536000000 // 1 year
        );
        if (recentHistory.length !== history.length) {
          this.borrowHistory.set(userId, recentHistory);
        }
      });
      this.performanceMetrics.lastOptimization = now;
    }
  }
}
