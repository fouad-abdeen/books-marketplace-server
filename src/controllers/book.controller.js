import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import { BookService } from "../services/book.service.js";
import { BookRepository } from "../repositories/book.repository.js";

export class BookController extends BaseService {
  _bookService;
  _bookRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._bookService = getService("bookService", BookService);
    this._bookRepository = getService("bookRepository", BookRepository);
    this.createBook = this.createBook.bind(this);
    this.updateBook = this.updateBook.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.getBookById = this.getBookById.bind(this);
    this.getListOfBookstoreBooks = this.getListOfBookstoreBooks.bind(this);
    this.uploadBookCover = this.uploadBookCover.bind(this);
    this.deleteBookCover = this.deleteBookCover.bind(this);
  }

  async createBook(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to create a new book");
      const createdBook = await this._bookService.createBook({
        ...req.body,
        bookstore: req.bookstoreId,
      });
      res.status(201).json(createdBook);
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to update a book");
      const updatedBook = await this._bookService.updateBook(
        {
          _id: req.params.id,
          bookstore: req.bookstoreId,
        },
        req.body
      );
      res.status(200).json(updatedBook);
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to delete a book");
      await this._bookService.deleteBook({
        _id: req.params.id,
        bookstore: req.bookstoreId,
      });
      res.status(204).json(null);
    } catch (error) {
      next(error);
    }
  }

  async getBookById(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get a book by ID");
      const book = await this._bookService.getBookById(req.params.id);
      res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  }

  async getListOfBookstoreBooks(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get books from a bookstore");
      const query = { bookstore: req.params.bookstore };
      if (req.query.genre) query.genre = req.query.genre;
      const pagination = {
        lastDocumentId: req.query.lastDocumentId,
        limit: req.query.limit,
      };
      const books = await this._bookRepository.getListOfBookstoreBooks(
        query,
        pagination
      );
      res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  }

  async uploadBookCover(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to upload a book cover");
      const fileInfo = await this._bookService.uploadBookCover(
        {
          _id: req.params.id,
          bookstore: req.bookstoreId,
        },
        req.file
      );
      res.status(200).json(fileInfo);
    } catch (error) {
      next(error);
    }
  }

  async deleteBookCover(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to delete a book cover");
      const book = await this._bookRepository.getBook({
        _id: req.params.id,
        bookstore: req.bookstoreId,
      });
      if (!book) throwError("Book not found", 404);
      await this._bookService.deleteBookCover(book);
      res.status(200).json(null);
    } catch (error) {
      next(error);
    }
  }
}
