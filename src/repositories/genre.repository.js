import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import genreSchema from "../schemas/genre.schema.js";

export class GenreRepository extends BaseService {
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("Genre", genreSchema);
  }

  async createGenre(genre) {
    this.setRequestId();
    this._logger.info(`Creating genre with name: ${genre.name}`);
    return (await this._model.create(genre)).toObject();
  }

  async updateGenre(query, name) {
    this.setRequestId();
    this._logger.info(`Updating genre with id: ${query._id}`);
    const updatedGenre = await this._model
      .findOneAndUpdate(query, { name }, { new: true })
      .lean()
      .exec();
    if (!updatedGenre) throwError(`Genre with Id ${query._id} not found`, 404);
    return updatedGenre;
  }

  async deleteGenre(query) {
    this.setRequestId();
    this._logger.info(`Deleting genre with id: ${query._id}`);
    await this._model.findOneAndDelete(query).lean().exec();
  }

  async getGenre(query) {
    this.setRequestId();
    this._logger.info(`Getting genre with query: ${JSON.stringify(query)}`);
    return await this._model.findOne(query).lean().exec();
  }

  async getBookstoreGenres(bookstore) {
    this.setRequestId();
    this._logger.info(`Getting all genres of bookstore with id: ${bookstore}`);
    const genres = await this._model.find({ bookstore }, "-__v").lean().exec();
    return genres;
  }
}
