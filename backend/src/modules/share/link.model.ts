import mongoose, { Document, Schema } from "mongoose";

export interface ILink extends Document {
  hash: string;
  userId: mongoose.Types.ObjectId;
}

const LinkSchema = new Schema<ILink>(
  {
    hash: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  },
  { timestamps: true }
);

export const LinkModel = mongoose.model<ILink>("Link", LinkSchema);
