import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookstore: { type: String, ref: "Bookstore", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, ref: "Genre", required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    publisher: { type: String, default: null },
    cover: { type: String, ref: "File", default: null },
    publicationYear: { type: Number, default: null },
  },
  { timestamps: true }
);

export default bookSchema;
