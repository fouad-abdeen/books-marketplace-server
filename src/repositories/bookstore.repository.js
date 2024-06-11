import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import bookstoreSchema from "../schemas/bookstore.schema.js";

export class BookstoreRepository extends BaseService {
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);

    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("Bookstore", bookstoreSchema);

    (async () => {
      await this._model.createIndexes();
    })();
  }

  async createBookstore(bookstore) {
    this.setRequestId();
    this._logger.info(`Creating bookstore with name: ${bookstore.name}`);
    const createdBookstore = (await this._model.create(bookstore)).toObject();
    return createdBookstore;
  }

  async updateBookstore(id, data) {
    this.setRequestId();
    this._logger.info(`Updating bookstore with id: ${id}`);
    const updatedBookstore = await this._model
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
    if (!updatedBookstore) throwError(`Bookstore with Id ${id} not found`, 404);
    return updatedBookstore;
  }

  async getBookstore(query) {
    this.setRequestId();
    this._logger.info(`Getting bookstore by query: ${JSON.stringify(query)}`);
    return await this._model
      .findOne(query)
      .populate({
        path: "logo",
        match: { _id: { $ne: null } },
        select: "key url",
      })
      .lean()
      .exec();
  }

  async getAllBookstores() {
    this.setRequestId();
    this._logger.info(`Getting list of all bookstores`);
    const bookstores = await this._model
      .find()
      .populate({
        path: "owner",
        select: "email name isEmailVerified",
      })
      .populate({
        path: "logo",
        match: { _id: { $ne: null } },
        select: "key url",
      })
      .lean()
      .exec();
    return bookstores;
  }

  async getActiveBookstores() {
    this.setRequestId();
    this._logger.info(`Getting list of active bookstores`);
    const bookstores = await this._model
      .find({ isActive: true }, "name description logo")
      .populate({
        path: "logo",
        match: { _id: { $ne: null } },
        select: "key url",
      })
      .lean()
      .exec();
    return bookstores;
  }
}
