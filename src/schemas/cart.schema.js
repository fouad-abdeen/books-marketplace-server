import { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    user: { type: String, ref: "User", required: true },
    bookstore: { type: String, ref: "Bookstore", default: null },
    books: {
      type: [{ id: String, quantity: Number, _id: false }],
      default: [],
    },
  },
  { timestamps: true }
);

export default cartSchema;
