# 📚 Advanced Library Management System

> A modern JavaScript library management system with performance monitoring, analytics, and smart categorization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code Style: Prettier](https://img.shields.io/badge/Code_Style-Prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## ✨ Features

- 📖 **Core Library Operations**
  - Add/remove books with validation
  - Borrow/return tracking
  - Smart search functionality
  - Category management

- 📊 **Analytics & Monitoring**
  - Performance metrics
  - Borrowing statistics
  - User history tracking
  - Popular books analysis

- 🔄 **Data Management**
  - JSON import/export
  - Automatic optimization
  - Category-based organization
  - Efficient data structures

## 🚀 Quick Start

1. **Clone & Install**
```bash
git clone https://github.com/naksh1414/Kata_library_Management_System.git
cd library-management-system
npm install
```

2. **Project Structure**
```
library-management-system/
├── src/
│   ├── book.js         # Book entity
│   └── library.js      # Core functionality
├── test/
│   └── library.test.js # Test suite
└── package.json
```

3. **Run Tests**
```bash
npm test          # Run all tests
```

## 💻 Usage Examples

```javascript
// Initialize
const library = new Library();

// Add books
library.addBook("978-1234567890", "Clean Code", "Robert C. Martin", 2024);
library.addBookWithCategory(
  "978-0987654321", 
  "Design Patterns", 
  "Gang of Four", 
  2024,
  "Software Engineering"
);

// Borrow & Return
library.borrowBook("978-1234567890", "user123");
library.returnBook("978-1234567890", "user123");

// Analytics
const stats = library.getBorrowingStats();
console.log(`Total Borrows: ${stats.totalBorrows}`);
```

## 🧪 Testing Coverage

- ✅ Core Operations
- ✅ Edge Cases
- ✅ Performance Monitoring
- ✅ Data Persistence
- ✅ Analytics Accuracy
- ✅ Category Management
- ✅ User History

## 🛠️ Performance Features

- **Automatic Optimization**
  - History cleanup
  - Performance metrics tracking
  - Efficient data structures

- **Smart Caching**
  - Category-based indexing
  - Quick search capabilities
  - Memory-efficient storage

## 🐳 Docker Setup

   1. **Build and Run with Docker Compose** 

```bash
   docker-compose up -d --build
```

   2. **Docker Structure**
```
├── Dockerfile          # Node.js container setup
├── docker-compose.yml  # Multi-container configuration
```

## 🔌 API Endpoints

### Books
- `POST /books` - Add new book
  ```bash
  curl -X POST http://localhost:3030/books -H "Content-Type: application/json" \
  -d '{"isbn":"123","title":"Clean Code","author":"Martin","publicationYear":2024}'
  ```

- `POST /books/category` - Add book with category
  ```bash
  curl -X POST http://localhost:3030/books/category -H "Content-Type: application/json" \
  -d '{"isbn":"456","title":"Design Patterns","author":"GoF","year":2024,"category":"Engineering"}'
  ```

### Borrowing
- `POST /books/:isbn/borrow` - Borrow book
  ```bash
  curl -X POST http://localhost:3030/books/123/borrow -H "Content-Type: application/json" \
  -d '{"userId":"user1"}'
  ```

- `POST /books/:isbn/return` - Return book
  ```bash
  curl -X POST http://localhost:3030/books/123/return -H "Content-Type: application/json" \
  -d '{"userId":"user1"}'
  ```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open pull request

---

<div align="center">
  Made with ❤️ by Nakshatra Manglik
  <br>
  Star ⭐ this repository if you find it helpful!
</div> 
