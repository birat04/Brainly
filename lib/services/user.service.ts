import { comparePassword, hashPassword } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { parseObjectId } from "@/lib/object-id";
import { usersCollection } from "@/lib/repos/collections";
import { deleteUserWorkspacesCascade } from "@/lib/services/workspace.service";
import { escapeRegex } from "@/lib/utils";

export async function updateProfile(
  userId: string,
  currentUsername: string,
  input: {
    fullName: string;
    username?: string;
    bio?: string;
    avatar?: string;
  },
) {
  const users = await usersCollection();
  const uid = parseObjectId(userId, "userId");

  if (input.username && input.username !== currentUsername) {
    const exists = await users.findOne({
      username: { $regex: `^${escapeRegex(input.username)}$`, $options: "i" },
    });
    if (exists && exists._id.toString() !== userId) {
      throw AppError.conflict("Username already taken");
    }
  }

  const updateDoc: Record<string, unknown> = {
    fullName: input.fullName,
    bio: input.bio ?? null,
    updatedAt: new Date(),
  };
  if (input.username) updateDoc.username = input.username;
  if (input.avatar !== undefined) updateDoc.avatar = input.avatar || null;

  await users.updateOne({ _id: uid }, { $set: updateDoc });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const users = await usersCollection();
  const uid = parseObjectId(userId, "userId");
  const existing = await users.findOne({ _id: uid });
  if (!existing) throw AppError.notFound("User not found");

  const ok = await comparePassword(currentPassword, existing.password);
  if (!ok) throw AppError.unauthorized("Current password is incorrect");

  const hashed = await hashPassword(newPassword);
  await users.updateOne({ _id: uid }, { $set: { password: hashed, updatedAt: new Date() } });
}

export async function deleteAccount(userId: string, password: string) {
  const users = await usersCollection();
  const uid = parseObjectId(userId, "userId");
  const existing = await users.findOne({ _id: uid });
  if (!existing) throw AppError.notFound("User not found");

  const ok = await comparePassword(password, existing.password);
  if (!ok) throw AppError.unauthorized("Invalid password");

  await deleteUserWorkspacesCascade(uid);
  await users.deleteOne({ _id: uid });
}
