import { Schema } from "mongoose";

const bookArchiveSchema = new Schema(
  {
    bookstore: { type: String, ref: "Bookstore", required: true },
    book: { type: String, ref: "Book", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: Object, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    publisher: { type: String, default: null },
    publicationYear: { type: Number, default: null },
  },
  { timestamps: true }
);

export default bookArchiveSchema;
