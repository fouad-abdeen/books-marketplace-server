import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import fileSchema from "../schemas/file.schema.js";

export class FileRepository extends BaseService {
  _mongodbService;
  _model;

  constructor(_mongoService) {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("File", fileSchema);
  }

  async createFile(fileInfo) {
    this.setRequestId();
    this._logger.info(`Creating the file with key: ${fileInfo.key}`);
    return (await this._model.create(fileInfo)).toObject();
  }

  async deleteFile(id) {
    this.setRequestId();
    this._logger.info(`Deleting file with id: ${id}`);
    await this._model.findByIdAndDelete(id);
  }

  async getFile(id) {
    this.setRequestId();
    this._logger.info(`Getting file with id: ${id}`);
    const file = await this._model.findById(id).lean().exec();
    if (!file) throwError(`File with Id ${id} not found`, 404);
    return file;
  }
}
