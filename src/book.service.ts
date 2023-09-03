import { Injectable, OnModuleInit } from '@nestjs/common';
import { Book, compareWithTitle } from './Book';
import { readFile } from 'fs/promises';

@Injectable()
export class BookService implements OnModuleInit {
  private readonly storage = new Map<string, Book>();

  async onModuleInit() {
    const data = await readFile('src/dataset.json');
    const books: Array<Book> = JSON.parse(data.toString());
    books.forEach((book) => this.addBook(book));
  }

  addBook(book: Book) {
    this.storage.set(book.isbn, book);
  }

  getBook(isbn: string): Book {
    const book = this.storage.get(isbn);
    if (!book) {
      throw new Error(`Book with ISBN ${isbn} not found`);
    }
    return book;
  }

  getAllBooks(): Array<Book> {
    return Array.from(this.storage.values()).sort(compareWithTitle);
  }

  getBooksOf(author: string): Array<Book> {
    return this.getAllBooks()
      .filter((book) => book.author === author)
      .sort(compareWithTitle);
  }

  getTotalNumberOfBooks(): number {
    return this.storage.size;
  }

  getBooksPublishedAfter(dateAsString: string): Array<Book> {
    const date = new Date(dateAsString);
    return this.getAllBooks()
      .filter((book) => new Date(book.date) > date)
      .sort(compareWithTitle);
  }

  delete(isbn: string) {
    this.storage.delete(isbn);
  }

  search(term: string): Array<Book> {
    return this.getAllBooks()
      .filter((book) => {
        return book.title.includes(term) || book.author.includes(term);
      })
      .sort(compareWithTitle);
  }
}
