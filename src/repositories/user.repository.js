import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import { throwError } from "../core/utils/error.js";
import userSchema from "../schemas/user.schema.js";

export class UserRepository extends BaseService {
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);

    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("User", userSchema);

    (async () => {
      await this._model.createIndexes();
    })();
  }

  async createUser(user) {
    this.setRequestId();
    this._logger.info(`Creating user with email: ${user.email}`);
    const createdUser = (await this._model.create(user)).toObject();

    delete createdUser.password;
    delete createdUser.tokensDenylist;
    delete createdUser.passwordUpdatedAt;
    delete createdUser.__v;
    return createdUser;
  }

  async updateUser(user) {
    const { _id, ...data } = user;
    this.setRequestId();
    this._logger.info(`Updating user with id: ${_id}`);
    const updatedUser = await this._model
      .findByIdAndUpdate(_id, data)
      .select("-password -tokensDenylist -passwordUpdatedAt -__v")
      .lean()
      .exec();
    if (!updatedUser) throwError(`User with Id ${_id} not found`, 404);
    return updatedUser;
  }

  async getUserById(id) {
    this.setRequestId();
    this._logger.info(`Getting user by id: ${id}`);
    const user = await this._model
      .findById(id, "-password -tokensDenylist -passwordUpdatedAt -__v")
      .lean()
      .exec();
    if (!user) throwError(`User with id ${id} not found`, 404);
    return user;
  }

  async getUserByEmail(email) {
    this.setRequestId();
    this._logger.info(`Getting user by email: ${email}`);
    const user = await this._model.findOne({ email }, "-__v").lean().exec();
    if (!user) throwError(`User with email ${email} not found`, 404);
    return user;
  }
}
