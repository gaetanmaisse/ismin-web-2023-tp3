import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { BookModule } from '../src/book.module';

describe('Books API', () => {
  let app: INestApplication;
  let httpRequester: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [BookModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    httpRequester = request(app.getHttpServer());
  });

  describe('GET /books', () => {
    it(`should return a list of books`, async () => {
      const response = await httpRequester.get('/books').expect(200);

      expect(response.body).toEqual(expect.any(Array));
    });
    it(`with author query should return all books of author`, async () => {
      // First prepare the data by adding some books
      await httpRequester.post('/books').send({
        isbn: '978-2081510436',
        title: 'Candide',
        author: 'Voltaire',
        date: '1759',
      });
      await httpRequester.post('/books').send({
        isbn: '978-2081510438',
        title: 'Zadig',
        author: 'Voltaire',
        date: '1748',
      });
      await httpRequester.post('/books').send({
        isbn: '978-2081510437',
        title: 'La Cantatrice chauve',
        author: 'Ionesco',
        date: '1950',
      });

      // Then get the previously stored book
      const response = await httpRequester
          .get('/books')
          .query({ author: 'Voltaire' })
          .expect(200);

      expect(response.body).toEqual([
        {
          isbn: '978-2081510436',
          title: 'Candide',
          author: 'Voltaire',
          date: '1759',
        },
        {
          isbn: '978-2081510438',
          title: 'Zadig',
          author: 'Voltaire',
          date: '1748',
        },
      ]);
    });
  });

  describe('POST /books', () => {
    it(`should create a book and return it`, async () => {
      const response = await httpRequester
          .post('/books')
          .send({
            isbn: '978-2081510436',
            title: 'Candide',
            author: 'Voltaire',
            date: '1759',
          })
          .expect(201);

      expect(response.body).toEqual({
        isbn: '978-2081510436',
        title: 'Candide',
        author: 'Voltaire',
        date: '1759',
      });
    });

    it('should return 400 if content is invalid', async () => {
      const response = await httpRequester.post('/books').send({
        title: 'Candide',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: [
          'isbn must be a string',
          'author must be a string',
          'date must be a valid ISO 8601 date string',
        ],
        statusCode: 400,
      });
    });
  });

  describe('GET /books/:isbn', () => {
    it(`should return the book matching the input isbn`, async () => {
      // First prepare the data by adding a book
      await httpRequester.post('/books').send({
        isbn: '978-2081510436',
        title: 'Candide',
        author: 'Voltaire',
        date: '1759',
      });

      // Then get the previously stored book
      const response = await httpRequester
          .get('/books/978-2081510436')
          .expect(200);

      expect(response.body).toEqual({
        isbn: '978-2081510436',
        title: 'Candide',
        author: 'Voltaire',
        date: '1759',
      });
    });
  });

  describe('DELETE /books/:isbn', () => {
    it(`should delete the book matching input isbn`, async () => {
      // First prepare the data by adding a book
      await httpRequester.post('/books').send({
        isbn: '978-2081510436',
        title: 'Candide',
        author: 'Voltaire',
        date: '1759',
      });

      // Delete the book
      await httpRequester.delete('/books/978-2081510436').expect(200);

      // Finally check the book was successfully deleted
      const response = await httpRequester.get('/books');

      expect(response.body).toEqual([]);
    });
  });

  describe('POST books/search', () => {
    it('should return the list of matching books', async () => {
      // First prepare the data by adding some books
      await httpRequester.post('/books').send({
        isbn: '978-2081510436',
        title: 'Candide',
        author: 'Voltaire',
        date: '1759',
      });
      await httpRequester.post('/books').send({
        isbn: '978-2081510438',
        title: 'Zadig',
        author: 'Voltaire',
        date: '1748',
      });
      await httpRequester.post('/books').send({
        isbn: '978-2081510437',
        title: 'La Cantatrice chauve',
        author: 'Ionesco',
        date: '1950',
      });

      // Search for books
      const response = await httpRequester.post('/books/search').send({
        term: 'Volt',
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          isbn: '978-2081510436',
          title: 'Candide',
          author: 'Voltaire',
          date: '1759',
        },
        {
          isbn: '978-2081510438',
          title: 'Zadig',
          author: 'Voltaire',
          date: '1748',
        },
      ]);
    });
  });
});
