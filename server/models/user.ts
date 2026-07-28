import mongoose from "mongoose";
//import { timeStamp } from "node:console";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    name: { type: String, require: true },
    zernioProfileId: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
