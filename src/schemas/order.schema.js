import { Schema } from "mongoose";
import { orderStatus } from "../shared/enums.js";

const orderSchema = new Schema(
  {
    user: { type: String, ref: "User" },
    bookstore: { type: String, ref: "Bookstore" },
    shippingInfo: {
      firstName: String,
      lastName: String,
      phone: String,
      address: String,
    },
    books: {
      type: [
        {
          id: String,
          quantity: Number,
          title: String,
          cover: String,
          price: Number,
          totalPrice: Number,
          _id: false,
        },
      ],
      default: [],
    },
    subtotal: { type: Number, required: true },
    shippingRate: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(orderStatus),
    },
  },
  { timestamps: true }
);

export default orderSchema;
