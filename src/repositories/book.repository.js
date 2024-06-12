import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import bookSchema from "../schemas/book.schema.js";

export class BookRepository extends BaseService {
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);

    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("Book", bookSchema);

    (async () => {
      await this._model.createIndexes();
    })();
  }

  async createBook(book) {
    this.setRequestId();
    this._logger.info(`Creating book with title: ${book.title}`);
    return (await this._model.create(book)).toObject();
  }

  async updateBook(query, data) {
    this.setRequestId();
    this._logger.info(`Updating book with id: ${query._id}`);
    const updatedBook = await this._model
      .findOneAndUpdate(query, data, { new: true })
      .lean()
      .exec();
    if (!updatedBook) throwError(`Book with Id ${query._id} not found`, 404);
    return updatedBook;
  }

  async deleteBook(query) {
    this.setRequestId();
    this._logger.info(`Deleting book with id: ${query.id}`);
    const deletedBook = await this._model.findOneAndDelete(query).lean().exec();
    if (!deletedBook) throwError(`Book with Id ${query.id} not found`, 404);
    return deletedBook;
  }

  async getBook(query) {
    this.setRequestId();
    this._logger.info(`Getting book by query: ${JSON.stringify(query)}`);
    return await this._model
      .findOne(query)
      .populate({
        path: "cover",
        match: { _id: { $ne: null } },
        select: "key url",
      })
      .lean()
      .exec();
  }

  async getListOfBookstoreBooks(query, pagination) {
    this.setRequestId();
    this._logger.info(
      `Getting books for bookstore with id: ${query.bookstore}`
    );
    // Get a list of books for a bookstore
    // paginated and sorted by the creation date in descending order
    return await this._model
      .find({
        ...query,
        ...(pagination.lastDocumentId
          ? { _id: { $lt: pagination.lastDocumentId } }
          : {}),
      })
      .populate({
        path: "cover",
        match: { _id: { $ne: null } },
        select: "key url",
      })
      .sort({ _id: -1 })
      .limit(pagination.limit ?? 10)
      .lean()
      .exec();
  }
}
