import mongoose from "mongoose";

const { Schema } = mongoose;

const genreSchema = new Schema(
  {
    bookstore: { type: String, ref: "Bookstore", required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default genreSchema;
