import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import { GenreService } from "../services/genre.service.js";
import { GenreRepository } from "../repositories/genre.repository.js";

export class GenreController extends BaseService {
  _genreService;
  _genreRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._genreService = getService("genreService", GenreService);
    this._genreRepository = getService("genreRepository", GenreRepository);
    this.createGenre = this.createGenre.bind(this);
    this.updateGenre = this.updateGenre.bind(this);
    this.deleteGenre = this.deleteGenre.bind(this);
    this.getAllGenres = this.getBookstoreGenres.bind(this);
  }

  async createGenre(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to create a new genre");
      const createdGenre = await this._genreService.createGenre({
        ...req.body,
        bookstore: req.bookstoreId,
      });
      res.status(201).json(createdGenre);
    } catch (error) {
      next(error);
    }
  }

  async updateGenre(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info(
        `Received a request to update a genre with id: ${req.params.id}`
      );
      const updatedGenre = await this._genreService.updateGenre({
        _id: req.params.id,
        bookstore: req.bookstoreId,
      });
      res.status(200).json(updatedGenre);
    } catch (error) {
      next(error);
    }
  }

  async deleteGenre(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info(
        `Received a request to delete a genre with id: ${req.params.id}`
      );
      await this._genreService.deleteGenre({
        _id: req.params.id,
        bookstore: req.bookstoreId,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getBookstoreGenres(req, res, next) {
    try {
      const bookstoreId = req.bookstoreId;
      this.setRequestId();
      this._logger.info(
        `Received a request to get genres of bookstore with id: ${bookstoreId}`
      );
      const genres = await this._genreRepository.getBookstoreGenres(
        bookstoreId
      );
      res.status(200).json(genres);
    } catch (error) {
      next(error);
    }
  }
}
