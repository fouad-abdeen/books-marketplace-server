import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { BookstoreService } from "../services/bookstore.service.js";
import { getService } from "../core/config/container.config.js";
import { BookstoreRepository } from "../repositories/bookstore.repository.js";

export class BookstoreController extends BaseService {
  _bookstoreService;
  _bookstoreRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._bookstoreService = getService("bookstoreService", BookstoreService);
    this._bookstoreRepository = getService(
      "bookstoreRepository",
      BookstoreRepository
    );
    this.createBookstore = this.createBookstore.bind(this);
    this.updateBookstore = this.updateBookstore.bind(this);
    this.getBookstore = this.getBookstore.bind(this);
    this.uploadBookstoreLogo = this.uploadBookstoreLogo.bind(this);
    this.deleteBookstoreLogo = this.deleteBookstoreLogo.bind(this);
    this.getAllBookstores = this.getAllBookstores.bind(this);
    this.getActiveBookstores = this.getActiveBookstores.bind(this);
    this.getBookstoreById = this.getBookstoreById.bind(this);
  }

  async createBookstore(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to create a new bookstore");
      const createdBookstore = await this._bookstoreService.createBookstore(
        req.body
      );
      res.status(201).json(createdBookstore);
    } catch (error) {
      next(error);
    }
  }

  async updateBookstore(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to update a bookstore");
      const updatedBookstore = await this._bookstoreService.updateBookstore(
        req.bookstoreId,
        req.body
      );
      res.status(200).json(updatedBookstore);
    } catch (error) {
      next(error);
    }
  }

  async getBookstore(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get owner's bookstore");
      const bookstore = req.bookstore;
      res.status(200).json(bookstore);
    } catch (error) {
      next(error);
    }
  }

  async uploadBookstoreLogo(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to upload a bookstore logo");
      const fileInfo = await this._bookstoreService.uploadBookstoreLogo(
        req.bookstore,
        req.file
      );
      res.status(200).json(fileInfo);
    } catch (error) {
      next(error);
    }
  }

  async deleteBookstoreLogo(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to delete a bookstore logo");
      await this._bookstoreService.deleteBookstoreLogo(req.bookstore);
      res.status(200).json(null);
    } catch (error) {
      next(error);
    }
  }

  async getAllBookstores(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get all bookstores");
      const bookstores = await this._bookstoreRepository.getAllBookstores();
      res.status(200).json(bookstores);
    } catch (error) {
      next(error);
    }
  }

  async getActiveBookstores(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get all active bookstores");
      const bookstores = await this._bookstoreRepository.getActiveBookstores();
      res.status(200).json(bookstores);
    } catch (error) {
      next(error);
    }
  }

  async getBookstoreById(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get a bookstore");
      const bookstore = await this._bookstoreRepository.getOneBookstore({
        _id: req.params.id,
      });
      res.status(200).json(bookstore);
    } catch (error) {
      next(error);
    }
  }
}
