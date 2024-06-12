import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import cartSchema from "../schemas/cart.schema.js";

export class CartRepository extends BaseService {
  _mongodbService;
  _model;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._mongodbService = getService("mongodbService");
    this._model = this._mongodbService.getModel("Cart", cartSchema);
  }

  async createCart(cart) {
    this.setRequestId();
    this._logger.info(`Creating cart for user: ${cart.user}`);
    return (await this._model.create(cart)).toObject();
  }

  async updateCart(query, data) {
    this.setRequestId();
    this._logger.info(`Updating cart by query: ${JSON.stringify(query)}`);
    return await this._model
      .findOneAndUpdate(query, data, { new: true })
      .select("-createdAt -updatedAt -__v")
      .lean()
      .exec();
  }

  async getCart(query) {
    this.setRequestId();
    this._logger.info(`Getting cart with query: ${JSON.stringify(query)}`);
    const cart = await this._model
      .findOne(query, "-createdAt -updatedAt -__v")
      .lean()
      .exec();
    if (!cart) return await this.createCart(query);
    return cart;
  }

  async getCartWithTotal(userId) {
    this.setRequestId();
    this._logger.info(`Getting cart with total for user: ${userId}`);

    const cart = await this._model.aggregate([
      // Match the cart by user id
      { $match: { user: userId } },

      // Deconstruct the books array
      { $unwind: "$books" },

      // Convert books.id from String to ObjectId
      {
        $addFields: {
          "books.id": { $toObjectId: "$books.id" },
        },
      },

      // Lookup book details from the books collection
      {
        $lookup: {
          from: "books",
          localField: "books.id",
          foreignField: "_id",
          as: "bookInfo",
        },
      },

      // Deconstruct the bookInfo array
      { $unwind: "$bookInfo" },

      // Group documents back together with aggregated fields
      {
        $group: {
          _id: "$_id",
          bookstore: { $first: "$bookstore" },
          user: { $first: "$user" },
          books: {
            $push: {
              id: "$books.id",
              quantity: "$books.quantity",
              title: "$bookInfo.title",
              cover: "$bookInfo.cover",
              price: "$bookInfo.price",
            },
          },
          total: {
            $sum: {
              $multiply: ["$books.quantity", "$bookInfo.price"],
            },
          },
        },
      },
    ]);

    if (!cart.length) return await this.getCart({ user: userId });

    return cart[0];
  }
}
