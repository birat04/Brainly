import { ContentModel } from "./content.model";

export function createContent(
  userId: string,
  payload: {
    title: string;
    content?: string;
    link: string;
    type: "video" | "article" | "image";
  }
) {
  return ContentModel.create({
    ...payload,
    userId,
    tags: [],
  });
}

export function getUserContent(userId: string) {
  return ContentModel.find({ userId }).sort({ createdAt: -1 });
}

export function deleteContent(userId: string, contentId: string) {
  return ContentModel.deleteOne({ _id: contentId, userId });
}

