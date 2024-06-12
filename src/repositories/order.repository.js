import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import orderSchema from "../schemas/order.schema.js";

export class OrderRepository extends BaseService {
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("Order", orderSchema);
  }

  async createOrder(order) {
    this.setRequestId();
    this._logger.info(`Creating order for user: ${order.user}`);
    return (await this._model.create(order)).toObject();
  }

  async updateOrder(query, data) {
    this.setRequestId();
    this._logger.info(`Updating order by query: ${JSON.stringify(query)}`);
    return await this._model
      .findOneAndUpdate(query, data, { new: true })
      .select("-createdAt -updatedAt -__v")
      .lean()
      .exec();
  }

  async getOrder(query) {
    this.setRequestId();
    this._logger.info(`Getting order with query: ${JSON.stringify(query)}`);
    return await this._model
      .findOne(query, "-createdAt -updatedAt -__v")
      .populate("user", "name email")
      .populate("bookstore", "_id name")
      .lean()
      .exec();
  }

  async getListOfOrders(query) {
    this.setRequestId();
    this._logger.info(`Getting orders with query: ${JSON.stringify(query)}`);
    return await this._model
      .find(
        query,
        "-shippingInfo -books -subtotal -shippingRate -createdAt -updatedAt -__v"
      )
      .populate("user", "name email")
      .populate("bookstore", "_id name")
      .lean()
      .exec();
  }
}
