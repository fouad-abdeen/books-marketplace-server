import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import bookArchiveSchema from "../schemas/book-archive.schema.js";

export class BookArchiveRepository extends BaseService {
  _archivesLimitPerBook = 5;
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);

    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel(
      "BookArchive",
      bookArchiveSchema
    );
  }

  async createBookArchive(archive) {
    this.setRequestId();
    this._logger.info(
      `Creating book archive for book with id: ${archive.book}`
    );
    const bookArchive = (await this._model.create(archive)).toObject();
    await this.#updateBookArchives(archive.book);
    return bookArchive;
  }

  async getBookArchives(query) {
    this.setRequestId();
    this._logger.info(`Getting archives for book with id: ${query.book}`);
    return await this._model
      .find(query, "-updatedAt -__v")
      .sort({ _id: -1 })
      .limit(this._archivesLimitPerBook)
      .lean()
      .exec();
  }

  async deleteBookArchives(book) {
    this.setRequestId();
    this._logger.info(`Deleting archives of book with id: ${book}`);
    await this._model.deleteMany({ book }).lean().exec();
  }

  async #updateBookArchives(book) {
    this.setRequestId();
    this._logger.info(`Updating archives for book with id: ${book}`);

    // Skip the first 'archivesLimitPerBook' documents and get the rest
    const archives = await this._model
      .find({ book }, "_id")
      .sort({ _id: -1 })
      .skip(this._archivesLimitPerBook)
      .lean()
      .exec();

    if (archives.length === 0) return;

    // Delete the oldest archives that exceed the limit
    await this._model.deleteMany({
      _id: { $in: archives.map((archive) => archive._id) },
    });
  }
}
