import { LinkModel } from "./link.model";
import { UserModel } from "../users/user.model";
import { ContentModel } from "../content/content.model";
import { random } from "../../utils/random";
import { ApiError } from "../../utils/ApiError";

export async function createOrGetShareLink(userId: string) {
  let link = await LinkModel.findOne({ userId });
  if (!link) {
    link = await LinkModel.create({ userId, hash: random(10) });
  }
  return link.hash;
}

export async function removeShareLink(userId: string) {
  await LinkModel.deleteOne({ userId });
}

export async function getSharedContent(hash: string) {
  const link = await LinkModel.findOne({ hash });
  if (!link) throw new ApiError(404, "Shareable link not found");

  const user = await UserModel.findById(link.userId);
  if (!user) throw new ApiError(404, "User not found");

  const content = await ContentModel.find({ userId: link.userId }).sort({ createdAt: -1 });
  return { username: user.username, content };
}
