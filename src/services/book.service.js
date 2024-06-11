import { isMongoId, isNotEmpty, isNumber, maxLength } from "class-validator";
import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import { env } from "../core/config/env.config.js";
import { BookRepository } from "../repositories/book.repository.js";
import { BookArchiveRepository } from "../repositories/book-archive.repository.js";
import { FileRepository } from "../repositories/file.repository.js";
import { GenreRepository } from "../repositories/genre.repository.js";

export class BookService extends BaseService {
  _fileService;
  _bookRepository;
  _bookArchiveRepository;
  _fileRepository;
  _genreRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._fileService = getService("fileService");
    this._bookRepository = getService("bookRepository", BookRepository);
    this._bookArchiveRepository = getService(
      "bookArchiveRepository",
      BookArchiveRepository
    );
    this._fileRepository = getService("fileRepository", FileRepository);
    this._genreRepository = getService("genreRepository", GenreRepository);
  }

  async createBook(book) {
    book.cover = null;
    await this.#validateBookCreation(book);
    return await this._bookRepository.createBook(book);
  }

  async updateBook(query, data) {
    delete data.bookstore;
    delete data.cover;
    await this.#validateBookUpdate(data);
    const book = await this._bookRepository.getBook(query);
    const updatedBook = await this._bookRepository.updateBook(query, data);
    await this._bookArchiveRepository.createBookArchive(book);
    return updatedBook;
  }

  async deleteBook(query) {
    const deletedBook = await this._bookRepository.deleteBook(query);
    await this._bookArchiveRepository.deleteBookArchives(query._id);
    await this.deleteBookCover(deletedBook);
  }

  async uploadBookCover(query, file) {
    this.setRequestId();
    this._logger.info(`Attempting to upload cover for book ${query._id}`);

    const book = await this._bookRepository.getBook(query);
    if (!book) throwError("Book not found", 404);

    const { originalname, buffer, size } = file;

    const maxBookCoverSize = 2 * 1024 * 1024; // 2MB
    if (size > maxBookCoverSize)
      throwError(`File size must be less than 2MB`, 400);

    let fileInfo = {};

    try {
      // Upload file to S3
      fileInfo = await this._fileService.uploadFile(
        `book-${book._id}`,
        `${originalname.split(".").pop()}`,
        buffer,
        env.awsS3.bucket,
        `book-covers/bookstore-${query.bookstore}/`,
        ["png", "jpg", "jpeg"]
      );
    } catch (error) {
      this._logger.error(error.message);
      throwError(`Failed to upload the book cover. ${error.message}`, 400);
    }

    if (!book.cover) {
      // Create a new file in the database
      const file = await this._fileRepository.createFile(fileInfo);

      // Update the book's cover
      await this._bookRepository.updateBook(book._id, {
        cover: file._id,
      });
    }

    return fileInfo;
  }

  async deleteBookCover(book) {
    this.setRequestId();
    this._logger.info(`Attempting to delete cover for book ${book._id}`);

    if (!book.cover) return;

    try {
      const file = await this._fileRepository.getFile(book.cover);

      // Delete file from S3
      await this._fileService.deleteFile(file.key, env.awsS3.bucket);

      // Delete file from the database
      await this._fileRepository.deleteFile(file._id);
    } catch (error) {
      this._logger.error(error.message);
      throwError(`Failed to delete the book cover. ${error.message}`, 400);
    }

    await this._bookRepository.updateBook(book._id, { cover: null });
  }

  async #validateBookCreation(book) {
    const {
      title,
      description,
      author,
      genre,
      price,
      availability,
      stock,
      publisher,
      publicationYear,
    } = book;

    if (!isNotEmpty(title) || !maxLength(title, 150))
      throwError(
        "Title cannot be empty and cannot be longer than 150 characters",
        400
      );

    if (!isNotEmpty(description) || !maxLength(description, 500))
      throwError(
        "Description cannot be empty and cannot be longer than 500 characters",
        400
      );

    if (!isNotEmpty(author) || !maxLength(author, 100))
      throwError(
        "Author cannot be empty and cannot be longer than 100 characters",
        400
      );

    if (!isMongoId(genre)) throwError("Invalid genre id", 400);
    const genreExists = await this._genreRepository.getGenre({ _id: genre });
    if (!genreExists) throwError("Genre not found", 404);

    if (!isNumber(price) || price <= 0) throwError("Invalid price", 400);
    if (price > 100) throwError("Price cannot be higher than $100", 400);

    if (typeof availability !== "boolean")
      throwError("Invalid availability value", 400);

    if (!isNumber(stock) || stock < 0) throwError("Invalid stock", 400);

    if (publisher && !maxLength(publisher, 150))
      throwError("Publisher cannot be longer than 150 characters", 400);

    this.#validatePublicationYear(publicationYear);
  }

  async #validateBookUpdate(book) {
    const {
      title,
      description,
      author,
      genre,
      price,
      availability,
      stock,
      publisher,
      publicationYear,
    } = book;

    if (title !== undefined && (!isNotEmpty(title) || !maxLength(title, 150)))
      throwError(
        "Title cannot be empty and cannot be longer than 150 characters",
        400
      );

    if (
      description !== undefined &&
      (!isNotEmpty(description) || !maxLength(description, 500))
    )
      throwError(
        "Description cannot be empty and cannot be longer than 500 characters",
        400
      );

    if (
      author !== undefined &&
      (!isNotEmpty(author) || !maxLength(author, 100))
    )
      throwError(
        "Author cannot be empty and cannot be longer than 100 characters",
        400
      );

    if (genre !== undefined) {
      if (!isMongoId(genre)) throwError("Invalid genre id", 400);
      const genreExists = await this._genreRepository.getGenre({ _id: genre });
      if (!genreExists) throwError("Genre not found", 404);
    }

    if ((price !== undefined && !isNumber(price)) || price <= 0)
      throwError("Invalid price", 400);
    if (price > 100) throwError("Price cannot be higher than $100", 400);

    if (availability !== undefined && typeof availability !== "boolean")
      throwError("Invalid availability", 400);

    if ((stock !== undefined && !isNumber(stock)) || stock < 0)
      throwError("Invalid stock", 400);

    if (publisher && !maxLength(publisher, 150))
      throwError("Publisher cannot be longer than 150 characters", 400);

    this.#validatePublicationYear(publicationYear);
  }

  #validatePublicationYear(publicationYear) {
    if (typeof publicationYear === "string")
      publicationYear = parseInt(publicationYear);
    if (publicationYear && !isNaN(publicationYear)) {
      if (!isNumber(publicationYear))
        throwError("Invalid publication year", 400);
      if (publicationYear < 610)
        throwError("Publication year cannot be earlier than 610 AD", 400);
      if (publicationYear > new Date().getFullYear())
        throwError("Publication year cannot be later than current year", 400);
    } else if (publicationYear !== null)
      throw new Error("Invalid publication year");
  }
}
