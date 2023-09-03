import { ISBN } from './ISBN';
import { IsDateString, IsString } from 'class-validator';

export interface BookDTO {
  authors: string;
  language_code: string;
  num_pages: string;
  publication_date: string;
  publisher: string;
  title: string;
  isbn: ISBN;
}
