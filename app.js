// app.js
import express from "express";
import { Library } from "./src/library.js";
const app = express();
app.use(express.json());
const library = new Library();

// Add book
app.post("/books", (req, res) => {
  try {
    const { isbn, title, author, publicationYear } = req.body;
    const book = library.addBook(isbn, title, author, publicationYear);
    return res.status(201).json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Add book with category
app.post("/books/category", (req, res) => {
  try {
    const { isbn, title, author, year, category } = req.body;
    const book = library.addBookWithCategory(
      isbn,
      title,
      author,
      year,
      category
    );
    res.status(201).json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Borrow book
app.post("/books/:isbn/borrow", (req, res) => {
  try {
    const { userId } = req.body;
    const book = library.borrowBook(req.params.isbn, userId);
    return res.json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Return book
app.post("/books/:isbn/return", (req, res) => {
  try {
    const { userId } = req.body;
    const book = library.returnBook(req.params.isbn, userId);
    return res.json(book);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Get available books
app.get("/books/available", (req, res) => {
  const books = library.getAvailableBooks();
  return res.json(books);
});

// Search books
app.get("/books/search", (req, res) => {
  const { query } = req.query;
  const books = library.searchBooks(query);
  return res.json(books);
});

// Get analytics
app.get("/analytics", (req, res) => {
  const analytics = library.getPopularityAnalytics();
  return res.json(analytics);
});

app.get("/metrics", async (req, res) => {
  const metrics = library.getPerformanceMetrics();
  return res.json(metrics);
});

app.listen(3030, () => console.log("Library API running on port 3030"));
