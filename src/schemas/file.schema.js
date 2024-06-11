import { Schema } from "mongoose";

const fileSchema = new Schema(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default fileSchema;
