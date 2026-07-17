import type { Collection, Document } from "mongodb";
import { comparePassword, generateToken, hashPassword } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { findUserByLogin } from "@/lib/find-user-by-login";
import { mapUser } from "@/lib/mappers";
import { parseObjectId } from "@/lib/object-id";
import { usersCollection } from "@/lib/repos/collections";
import type { UserDoc } from "@/lib/repos/types";
import { ensurePersonalWorkspace } from "@/lib/services/workspace.service";
import { normalizeLoginIdentifier } from "@/lib/utils";

export async function signUpUser(input: {
  email: string;
  username: string;
  fullName: string;
  password: string;
}) {
  const email = normalizeLoginIdentifier(input.email).toLowerCase();
  const username = normalizeLoginIdentifier(input.username);
  const users = await usersCollection();

  const existing = await users.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw AppError.conflict(
      String(existing.email).toLowerCase() === email ? "Email already registered" : "Username already taken",
    );
  }

  const hashedPassword = await hashPassword(input.password);
  const now = new Date();
  const newUser: Omit<UserDoc, "_id"> = {
    email,
    username,
    fullName: input.fullName,
    password: hashedPassword,
    avatar: null,
    bio: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await users.insertOne(newUser as UserDoc);
  const userId = result.insertedId.toString();
  const { workspaceId, role } = await ensurePersonalWorkspace(userId, username);

  const token = await generateToken({
    userId,
    email,
    username,
    workspaceId,
    role,
  });

  return {
    token,
    user: mapUser({ _id: result.insertedId, ...newUser, password: hashedPassword }),
    workspaceId,
  };
}

export async function signInUser(identifierRaw: string, password: string) {
  const identifier = normalizeLoginIdentifier(identifierRaw);
  const users = await usersCollection();
  const user = await findUserByLogin(users as unknown as Collection<Document>, identifier);

  if (!user) {
    if (process.env.NODE_ENV === "development") {
      const count = await users.countDocuments();
      console.warn("[auth/signin] No user for identifier:", identifier.slice(0, 64), "| users:", count);
    }
    throw AppError.unauthorized("Invalid credentials");
  }

  const valid = await comparePassword(password, user.password as string);
  if (!valid) {
    throw AppError.unauthorized("Invalid credentials");
  }

  const userId = String(user._id);
  const { workspaceId, role } = await ensurePersonalWorkspace(userId, user.username as string);

  const token = await generateToken({
    userId,
    email: user.email as string,
    username: user.username as string,
    workspaceId,
    role,
  });

  return {
    token,
    user: mapUser(user as unknown as Record<string, unknown>),
    workspaceId,
  };
}

export async function getCurrentUser(userId: string) {
  const users = await usersCollection();
  const user = await users.findOne({ _id: parseObjectId(userId, "userId") });
  if (!user) throw AppError.notFound("User not found");
  return mapUser(user as unknown as Record<string, unknown>);
}
