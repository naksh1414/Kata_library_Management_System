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
      popularityTrends: {
        daily: new Map(),
        weekly: new Map(),
        monthly: new Map(),
      },
      genrePopularity: new Map(),
    };

    let totalDuration = 0;
    let totalReturns = 0;

    this.borrowHistory.forEach((history) => {
      let lastBorrowDate = null;

      history.forEach((record) => {
        const timestamp = new Date(record.timestamp);

        if (record.action === "borrow") {
          stats.totalBorrows++;
          lastBorrowDate = timestamp;

          // Update popularity counts
          const count = stats.popularBooks.get(record.isbn) || 0;
          stats.popularBooks.set(record.isbn, count + 1);

          // Daily trends
          const dayKey = timestamp.toISOString().split("T")[0];
          const dailyCount = stats.popularityTrends.daily.get(dayKey) || 0;
          stats.popularityTrends.daily.set(dayKey, dailyCount + 1);

          // Weekly trends
          const weekKey = this.getWeekNumber(timestamp);
          const weeklyCount = stats.popularityTrends.weekly.get(weekKey) || 0;
          stats.popularityTrends.weekly.set(weekKey, weeklyCount + 1);

          // Monthly trends
          const monthKey = `${timestamp.getFullYear()}-${
            timestamp.getMonth() + 1
          }`;
          const monthlyCount =
            stats.popularityTrends.monthly.get(monthKey) || 0;
          stats.popularityTrends.monthly.set(monthKey, monthlyCount + 1);

          // Genre popularity
          const book = this.books.get(record.isbn);
          if (book) {
            for (const [category] of this.categories) {
              if (
                this.getBooksByCategory(category).some(
                  (b) => b.isbn === book.isbn
                )
              ) {
                const genreCount = stats.genrePopularity.get(category) || 0;
                stats.genrePopularity.set(category, genreCount + 1);
              }
            }
          }
        } else if (record.action === "return" && lastBorrowDate) {
          const duration = timestamp - lastBorrowDate;
          totalDuration += duration;
          totalReturns++;
          lastBorrowDate = null;
        }
      });
    });

    stats.activeLoans = Array.from(this.books.values()).filter(
      (book) => !book.isAvailable
    ).length;

    stats.averageLoanDuration =
      totalReturns > 0 ? totalDuration / totalReturns : 0;

    // Sort and get top popular books
    stats.topBooks = Array.from(stats.popularBooks.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([isbn, count]) => ({
        book: this.books.get(isbn),
        borrowCount: count,
      }));

    // Calculate popularity scores
    stats.popularityScores = this.calculatePopularityScores(stats);

    return stats;
  }

  getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return `${d.getUTCFullYear()}-${Math.ceil(
      ((d - yearStart) / 86400000 + 1) / 7
    )}`;
  }

  calculatePopularityScores(stats) {
    const scores = new Map();
    const currentDate = new Date();

    this.books.forEach((book, isbn) => {
      const borrowCount = stats.popularBooks.get(isbn) || 0;
      const recentBorrows = Array.from(stats.popularityTrends.daily.entries())
        .filter(([date]) => {
          const daysAgo =
            (currentDate - new Date(date)) / (1000 * 60 * 60 * 24);
          return daysAgo <= 30;
        })
        .reduce((sum, [_, count]) => sum + count, 0);

      const score = {
        totalScore: borrowCount * 0.4 + recentBorrows * 0.6,
        factors: {
          totalBorrows: borrowCount,
          recentBorrows,
          availability: book.isAvailable ? 1 : 0,
        },
      };

      scores.set(isbn, score);
    });

    return scores;
  }

  getPopularityAnalytics(timeframe = "all") {
    const stats = this.getBorrowingStats();
    const currentDate = new Date();

    const analytics = {
      topBooks: stats.topBooks,
      trendingGenres: Array.from(stats.genrePopularity.entries()).sort(
        (a, b) => b[1] - a[1]
      ),
      trends: {
        daily: Array.from(stats.popularityTrends.daily.entries()),
        weekly: Array.from(stats.popularityTrends.weekly.entries()),
        monthly: Array.from(stats.popularityTrends.monthly.entries()),
      },
      recommendations: [],
    };

    // Generate recommendations based on popularity scores
    const scores = Array.from(stats.popularityScores.entries())
      .sort((a, b) => b[1].totalScore - a[1].totalScore)
      .slice(0, 5)
      .map(([isbn]) => this.books.get(isbn));

    analytics.recommendations = scores;

    return analytics;
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
