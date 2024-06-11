import mongoose from "mongoose";

const bookstoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    owner: { type: String, ref: "User", required: true },
    phone: { type: String, required: true },
    shippingRate: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, default: null },
    logo: { type: String, ref: "File", default: null },
    socialMedia: {
      type: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedIn: String,
      },
      default: {},
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default bookstoreSchema;
