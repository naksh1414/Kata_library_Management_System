export class Book {
  constructor(isbn, title, author, publicationYear) {
    this.isbn = isbn;
    this.title = title;
    this.author = author;
    this.publicationYear = publicationYear;
    this.isAvailable = true;
  }
}
