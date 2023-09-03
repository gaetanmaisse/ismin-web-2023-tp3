import { ISBN } from './ISBN';
import { IsDateString, IsString } from 'class-validator';

export class Book {
  /**
   * International Standard Book Number of the book
   */
  @IsString()
  isbn: ISBN;

  /**
   * Title of the book
   */
  @IsString()
  title: string;

  /**
   * Author of the book
   */
  @IsString()
  author: string;

  /**
   * Date of publication of the book
   */
  @IsDateString()
  date: string;

  constructor(isbn: ISBN, title: string, author: string, date: string) {
    this.isbn = isbn;
    this.title = title;
    this.author = author;
    this.date = date;
  }
}

export const compareWithTitle = (a: Book, b: Book): number => {
  return a.title.localeCompare(b.title);
};
