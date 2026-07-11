import mongoose from "mongoose";

const { Schema } = mongoose;

export const userSchema = new Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  code: { type: String, unique: true },
  active: { type: Boolean, default: true },
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
  refreshToken: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

export type User = mongoose.InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.Document & User;
export const UserModel = mongoose.model("User", userSchema);
