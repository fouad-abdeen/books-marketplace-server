import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import { BookArchiveRepository } from "../repositories/book-archive.repository.js";

export class BookArchiveController extends BaseService {
  _bookArchiveRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._bookArchiveRepository = getService(
      "bookArchiveRepository",
      BookArchiveRepository
    );
    this.getBookArchives = this.getBookArchives.bind(this);
  }

  async getBookArchives(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get book archives");
      const archives = await this._bookArchiveRepository.getBookArchives({
        book: req.params.id,
        bookstore: req.bookstoreId,
      });
      res.status(200).json(archives);
    } catch (error) {
      next(error);
    }
  }
}
