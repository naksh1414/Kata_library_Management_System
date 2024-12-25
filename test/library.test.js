import { describe, expect, test, beforeEach } from "@jest/globals";
import { Library } from "../src/library.js";

describe("Library Management System", () => {
  let library;

  beforeEach(() => {
    library = new Library();
  });

  describe("Book Addition", () => {
    test("should add book with valid details", () => {
      const book = library.addBook("123", "Test Book", "Author", 2024);
      expect(book.isbn).toBe("123");
      expect(book.title).toBe("Test Book");
      expect(book.author).toBe("Author");
      expect(book.publicationYear).toBe(2024);
      expect(book.isAvailable).toBe(true);
    });

    test("should reject invalid ISBN", () => {
      expect(() => library.addBook("", "Test Book", "Author", 2024)).toThrow(
        "All book details are required"
      );
    });

    test("should reject invalid title", () => {
      expect(() => library.addBook("123", "", "Author", 2024)).toThrow(
        "All book details are required"
      );
    });

    test("should reject invalid author", () => {
      expect(() => library.addBook("123", "Test Book", "", 2024)).toThrow(
        "All book details are required"
      );
    });

    test("should reject invalid publication year", () => {
      expect(() => library.addBook("123", "Test Book", "Author", null)).toThrow(
        "All book details are required"
      );
    });

    test("should reject future publication year", () => {
      expect(() => library.addBook("123", "Test Book", "Author", 2050)).toThrow(
        "Invalid publication year"
      );
    });

    test("should reject very old publication year", () => {
      expect(() => library.addBook("123", "Test Book", "Author", 1000)).toThrow(
        "Invalid publication year"
      );
    });

    test("should reject duplicate ISBN", () => {
      library.addBook("123", "Test Book", "Author", 2024);
      expect(() =>
        library.addBook("123", "Another Book", "Author", 2024)
      ).toThrow("Book with this ISBN already exists");
    });
  });

  describe("Book Borrowing", () => {
    beforeEach(() => {
      library.addBook("123", "Test Book", "Author", 2024);
    });

    test("should allow borrowing available book", () => {
      const book = library.borrowBook("123");
      expect(book.isAvailable).toBe(false);
    });

    test("should reject borrowing nonexistent book", () => {
      expect(() => library.borrowBook("456")).toThrow("Book not found");
    });

    test("should reject borrowing already borrowed book", () => {
      library.borrowBook("123");
      expect(() => library.borrowBook("123")).toThrow("Book is not available");
    });

    test("should track multiple borrows after returns", () => {
      library.borrowBook("123");
      library.returnBook("123");
      const book = library.borrowBook("123");
      expect(book.isAvailable).toBe(false);
    });
  });

  describe("Book Returns", () => {
    beforeEach(() => {
      library.addBook("123", "Test Book", "Author", 2024);
      library.borrowBook("123");
    });

    test("should allow returning borrowed book", () => {
      const book = library.returnBook("123");
      expect(book.isAvailable).toBe(true);
    });

    test("should reject returning nonexistent book", () => {
      expect(() => library.returnBook("456")).toThrow("Book not found");
    });

    test("should reject returning already returned book", () => {
      library.returnBook("123");
      expect(() => library.returnBook("123")).toThrow(
        "Book is already in library"
      );
    });
  });

  describe("Available Books Listing", () => {
    test("should show empty list for new library", () => {
      expect(library.getAvailableBooks()).toHaveLength(0);
    });

    test("should show all books when none borrowed", () => {
      library.addBook("123", "Book 1", "Author 1", 2024);
      library.addBook("456", "Book 2", "Author 2", 2024);
      expect(library.getAvailableBooks()).toHaveLength(2);
    });

    test("should exclude borrowed books", () => {
      library.addBook("123", "Book 1", "Author 1", 2024);
      library.addBook("456", "Book 2", "Author 2", 2024);
      library.borrowBook("123");
      const available = library.getAvailableBooks();
      expect(available).toHaveLength(1);
      expect(available[0].isbn).toBe("456");
    });

    test("should show returned books", () => {
      library.addBook("123", "Book 1", "Author 1", 2024);
      library.borrowBook("123");
      library.returnBook("123");
      expect(library.getAvailableBooks()).toHaveLength(1);
    });
  });

  describe("Edge Cases", () => {
    test("should handle special characters in book details", () => {
      const book = library.addBook(
        "123-456",
        "Test & Book!",
        "Author Jr.",
        2024
      );
      expect(book.title).toBe("Test & Book!");
    });

    test("should handle minimum valid year", () => {
      const book = library.addBook("123", "Test Book", "Author", 1900);
      expect(book.publicationYear).toBe(1900);
    });

    test("should handle maximum valid year", () => {
      const currentYear = new Date().getFullYear();
      const book = library.addBook("123", "Test Book", "Author", currentYear);
      expect(book.publicationYear).toBe(currentYear);
    });

    test("should handle concurrent operations", () => {
      library.addBook("123", "Book 1", "Author 1", 2024);
      library.addBook("456", "Book 2", "Author 2", 2024);

      library.borrowBook("123");
      library.borrowBook("456");

      library.returnBook("123");

      const available = library.getAvailableBooks();
      expect(available).toHaveLength(1);
      expect(available[0].isbn).toBe("123");
    });
  });

  describe("Book Search", () => {
    beforeEach(() => {
      library.addBook("123", "JavaScript Programming", "John Doe", 2024);
      library.addBook("456", "Python Basics", "Jane Smith", 2023);
      library.addBook("789", "JavaScript Advanced", "Bob Wilson", 2024);
    });

    test("should find books by title keyword", () => {
      const results = library.searchBooks("JavaScript");
      expect(results).toHaveLength(2);
    });

    test("should find books by author", () => {
      const results = library.searchBooks("Smith");
      expect(results).toHaveLength(1);
      expect(results[0].author).toBe("Jane Smith");
    });

    test("should find books by year", () => {
      const results = library.searchBooks("2024");
      expect(results).toHaveLength(2);
    });

    test("should return empty array for no matches", () => {
      const results = library.searchBooks("Ruby");
      expect(results).toHaveLength(0);
    });

    test("should handle case-insensitive search", () => {
      const results = library.searchBooks("javascript");
      expect(results).toHaveLength(2);
    });
  });

  describe("Book Deletion", () => {
    beforeEach(() => {
      library.addBook("123", "Test Book", "Author", 2024);
    });

    test("should delete available book", () => {
      expect(library.deleteBook("123")).toBe(true);
      expect(() => library.borrowBook("123")).toThrow("Book not found");
    });

    test("should reject deleting nonexistent book", () => {
      expect(() => library.deleteBook("456")).toThrow("Book not found");
    });

    test("should reject deleting borrowed book", () => {
      library.borrowBook("123");
      expect(() => library.deleteBook("123")).toThrow(
        "Cannot delete borrowed book"
      );
    });

    test("should allow deletion after return", () => {
      library.borrowBook("123");
      library.returnBook("123");
      expect(library.deleteBook("123")).toBe(true);
    });
  });

  describe("Enhanced Features", () => {
    describe("Performance Tests", () => {
      test("should handle bulk operations efficiently", async () => {
        const operations = Array.from({ length: 1000 }, (_, i) => ({
          isbn: `ISBN${i}`,
          title: `Book ${i}`,
          author: `Author ${i}`,
          year: 2024,
        }));

        operations.forEach((op) =>
          library.addBook(op.isbn, op.title, op.author, op.year)
        );

        const metrics = library.getPerformanceMetrics();
        expect(metrics.operationsPerSecond).toBeGreaterThan(100);
      });

      test("should optimize performance periodically", () => {
        library.optimizePerformance();
        const metrics = library.getPerformanceMetrics();
        expect(metrics.lastOptimization).toBeLessThanOrEqual(Date.now());
      });
    });

    describe("Data Persistence", () => {
      test("should export and import library state", () => {
        library.addBook("123", "Test", "Author", 2024);
        library.borrowBook("123", "user1");

        const exported = library.exportToJSON();
        const newLibrary = new Library();

        expect(newLibrary.importFromJSON(exported)).toBe(true);
        expect(newLibrary.books.size).toBe(1);
        expect(newLibrary.borrowHistory.has("user1")).toBe(true);
      });
    });

    describe("Analytics", () => {
      test("should provide detailed borrowing stats", () => {
        library.addBook("123", "Test", "Author", 2024);
        library.borrowBook("123", "user1");
        library.returnBook("123", "user1");

        const stats = library.getBorrowingStats();
        expect(stats.totalBorrows).toBe(1);
        expect(stats.activeLoans).toBe(0);
        expect(stats.popularBooks.get("123")).toBe(1);
      });
    });

    describe("Category Management", () => {
      test("should manage books by category", () => {
        library.addBookWithCategory(
          "123",
          "JavaScript",
          "Author",
          2024,
          "Programming"
        );
        library.addBookWithCategory(
          "456",
          "Python",
          "Author",
          2024,
          "Programming"
        );

        const programmingBooks = library.getBooksByCategory("Programming");
        expect(programmingBooks).toHaveLength(2);
        expect(programmingBooks[0].title).toContain("JavaScript");
      });

      test("should handle books in multiple categories", () => {
        library.addBookWithCategory(
          "123",
          "JavaScript",
          "Author",
          2024,
          "Programming"
        );
        const book = library.books.get("123");
        expect(book).toBeDefined();

        library.categories.set("WebDev", new Set(["123"]));
        const webDevBooks = library.getBooksByCategory("WebDev");
        expect(webDevBooks).toHaveLength(1);
      });
    });

    describe("User History", () => {
      test("should track complete user interaction history", () => {
        library.addBook("123", "Test", "Author", 2024);
        library.borrowBook("123", "user1");
        library.returnBook("123", "user1");

        const history = library.getUserHistory("user1");
        expect(history).toHaveLength(2);
        expect(history[0].action).toBe("borrow");
        expect(history[1].action).toBe("return");
      });
    });
  });

  describe("Book Analytics", () => {
    beforeEach(() => {
      library.addBookWithCategory(
        "123",
        "JavaScript",
        "Author",
        2024,
        "Programming"
      );
      library.addBookWithCategory(
        "456",
        "Python",
        "Author",
        2024,
        "Programming"
      );
      library.addBookWithCategory("789", "Novel", "Author", 2024, "Fiction");
    });

    test("should track popularity trends", () => {
      library.borrowBook("123", "user1");
      library.returnBook("123", "user1");
      library.borrowBook("123", "user2");
      library.borrowBook("456", "user3");

      const stats = library.getBorrowingStats();
      expect(stats.popularBooks.get("123")).toBe(2);
      expect(stats.popularBooks.get("456")).toBe(1);
    });

    test("should calculate popularity scores", () => {
      library.borrowBook("123", "user1");
      library.returnBook("123", "user1");
      library.borrowBook("123", "user2");
      library.returnBook("123", "user2");

      const analytics = library.getPopularityAnalytics();
      expect(analytics.topBooks[0].borrowCount).toBe(2);
      expect(analytics.trendingGenres[0][0]).toBe("Programming");
    });

    test("should track genre popularity", () => {
      library.borrowBook("123", "user1");
      library.returnBook("123", "user1");
      library.borrowBook("456", "user2");
      library.returnBook("456", "user2");
      library.borrowBook("789", "user3");
      library.returnBook("789", "user3");

      const stats = library.getBorrowingStats();
      expect(stats.genrePopularity.get("Programming")).toBe(2);
      expect(stats.genrePopularity.get("Fiction")).toBe(1);
    });

    test("should generate recommendations", () => {
      library.borrowBook("123", "user1");
      library.returnBook("123", "user1");
      library.borrowBook("123", "user2");
      library.returnBook("123", "user2");
      library.borrowBook("456", "user3");
      library.returnBook("456", "user3");

      const analytics = library.getPopularityAnalytics();
      expect(analytics.recommendations.length).toBeGreaterThan(0);
      expect(analytics.recommendations[0].isbn).toBe("123");
    });
  });

  describe("Performance Tests", () => {
    test("should handle bulk operations within memory constraints", async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const startTime = performance.now();

      // Add 10,000 books
      for (let i = 0; i < 10000; i++) {
        library.addBook(`ISBN${i}`, `Book Title ${i}`, `Author ${i}`, 2024);
      }

      const endTime = performance.now();
      const finalMemory = process.memoryUsage().heapUsed;

      // Performance assertions
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in 5 seconds
      expect((finalMemory - initialMemory) / 1024 / 1024).toBeLessThan(100); // Less than 100MB increase
    });

    test("should perform search operations efficiently", () => {
      // Populate library
      for (let i = 0; i < 1000; i++) {
        library.addBook(`ISBN${i}`, `Title${i}`, `Author${i}`, 2024);
      }

      const startTime = performance.now();
      const results = library.searchBooks("Title500");
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Search should take less than 100ms
      expect(results).toHaveLength(1);
    });

    test("should maintain performance with concurrent operations", async () => {
      const operations = [];
      const startTime = performance.now();

      // Simulate concurrent operations
      for (let i = 0; i < 100; i++) {
        operations.push(
          library.addBook(`ISBN${i}`, `Title${i}`, `Author${i}`, 2024),
          library.searchBooks("Title"),
          library.getAvailableBooks()
        );
      }

      await Promise.all(operations);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should handle 300 operations under 1 second
    });

    test("should optimize memory usage over time", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Add books and create history
      for (let i = 0; i < 1000; i++) {
        const isbn = `ISBN${i}`;
        library.addBook(isbn, `Title${i}`, `Author${i}`, 2024);
        library.borrowBook(isbn, `user${i}`);
        library.returnBook(isbn, `user${i}`);
      }

      // Force optimization
      library.optimizePerformance();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;

      expect(memoryIncreaseMB).toBeLessThan(50); // Memory growth should be limited
    });

    test("should handle large analytics calculations efficiently", () => {
      // Prepare test data
      for (let i = 0; i < 500; i++) {
        const isbn = `ISBN${i}`;
        library.addBookWithCategory(
          isbn,
          `Title${i}`,
          `Author${i}`,
          2024,
          `Category${i % 10}`
        );
        library.borrowBook(isbn, `user${i}`);
        library.returnBook(isbn, `user${i}`);
      }

      const startTime = performance.now();
      const analytics = library.getPopularityAnalytics();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Analytics should complete in 500ms
      expect(analytics.recommendations.length).toBeGreaterThan(0);
    });
  });
});
