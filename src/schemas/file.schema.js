import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default fileSchema;
