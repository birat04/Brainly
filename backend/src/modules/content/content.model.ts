import mongoose, { Document, Schema } from "mongoose";

export interface IContent extends Document {
  title: string;
  content?: string;
  link: string;
  type: "video" | "article" | "image";
  tags: string[];
  userId: mongoose.Types.ObjectId;
}

const ContentSchema = new Schema<IContent>(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    link: { type: String, required: true },
    type: { type: String, required: true },
    tags: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ContentModel = mongoose.model<IContent>("Content", ContentSchema);

