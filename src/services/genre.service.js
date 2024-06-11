import { fileURLToPath } from "url";
import { Context } from "../core/context.js";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import { GenreRepository } from "../repositories/genre.repository.js";
import { isMongoId, isNotEmpty, isString, maxLength } from "class-validator";
import { BookRepository } from "../repositories/book.repository.js";

export class GenreService extends BaseService {
  _genreRepository;
  _bookRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._genreRepository = getService("genreRepository", GenreRepository);
    this._bookRepository = getService("bookRepository", BookRepository);
  }

  async createGenre(genre) {
    if (!isNotEmpty(genre.name) || !maxLength(genre.name, 50))
      throwError(
        "Genre name cannot be empty and cannot be longer than 50 characters",
        400
      );
    const genreExist = await this._genreRepository.getGenre(genre);
    if (genreExist) throwError("Genre already exists", 400);
    return await this._genreRepository.createGenre(genre);
  }

  async updateGenre(query, name) {
    if (!isMongoId(query._id)) throwError("Invalid genre id", 400);
    if (!isNotEmpty(name) || !maxLength(name, 50))
      throwError(
        "Genre name cannot be empty and cannot be longer than 50 characters",
        400
      );
    return await this._genreRepository.updateGenre(query, name);
  }

  async deleteGenre(query) {
    if (!isMongoId(query._id)) throwError("Invalid genre id", 400);
    const assignedToBooks = await this._bookRepository.getBook({
      genre: query._id,
    });
    if (assignedToBooks)
      throwError(
        "Cannot delete a genre that is assigned to at least one book",
        400
      );
    return await this._genreRepository.deleteGenre(query);
  }
}
