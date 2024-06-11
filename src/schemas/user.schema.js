import mongoose from "mongoose";
import { userRole } from "../shared/enums.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(userRole),
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    tokensDenylist: { type: [{ token: String, expiry: Number }], default: [] },
    passwordUpdatedAt: { type: Number, default: +new Date() },
  },
  { timestamps: true }
);

export default userSchema;
