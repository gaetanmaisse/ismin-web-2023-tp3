import { Injectable, OnModuleInit } from '@nestjs/common';
import { Book, compareWithTitle } from './Book';
import { readFile } from 'fs/promises';
import { HttpService } from '@nestjs/axios';
import { first, firstValueFrom, map, tap } from 'rxjs';
import { BookDTO } from './BookDTO';

@Injectable()
export class BookService implements OnModuleInit {
  private readonly storage = new Map<string, Book>();

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await Promise.all([this.loadBooksFromFile(), this.loadBooksFromServer()]);
    console.log(`Storage contains ${this.storage.size} books`);
  }

  private async loadBooksFromFile() {
    const data = await readFile('src/dataset.json');
    const books: Array<Book> = JSON.parse(data.toString());
    books.forEach((book) => this.addBook(book));
  }

  private async loadBooksFromServer(): Promise<void> {
    return firstValueFrom(
      this.httpService.get('https://api.npoint.io/fbb2a6039fc21e320b30').pipe(
        map((response) => response.data),
        tap((books: BookDTO[]) => {
          books.forEach((book) =>
            this.addBook({
              title: book.title,
              author: book.authors,
              date: book.publication_date,
              isbn: book.isbn,
            }),
          );
        }),
        map(() => undefined),
      ),
    );
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
