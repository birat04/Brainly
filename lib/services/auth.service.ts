import type { Collection, Document } from "mongodb";
import { ObjectId } from "mongodb";
import { comparePassword, hashPassword } from "@/lib/auth";
import {
  createSession,
  rotateSession,
  revokeAllUserSessions,
  revokeSessionByRefresh,
  updateSessionWorkspace,
} from "@/lib/auth/session";
import { generateAccessToken } from "@/lib/auth/access-token";
import { AppError } from "@/lib/errors";
import { findUserByLogin } from "@/lib/find-user-by-login";
import { mapUser } from "@/lib/mappers";
import { parseObjectId } from "@/lib/object-id";
import { usersCollection } from "@/lib/repos/collections";
import type { UserDoc } from "@/lib/repos/types";
import {
  ensurePersonalWorkspace,
  listWorkspacesForUser,
  requireWorkspaceMember,
} from "@/lib/services/workspace.service";
import { normalizeLoginIdentifier } from "@/lib/utils";

async function issueTokens(params: {
  userId: string;
  email: string;
  username: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  userAgent?: string | null;
}) {
  const session = await createSession({
    userId: params.userId,
    workspaceId: params.workspaceId,
    role: params.role,
    userAgent: params.userAgent,
  });
  const accessToken = await generateAccessToken({
    userId: params.userId,
    email: params.email,
    username: params.username,
    workspaceId: params.workspaceId,
    role: params.role,
    sessionId: session.sessionId,
  });
  return {
    token: accessToken,
    refreshToken: session.refreshToken,
    workspaceId: params.workspaceId,
    sessionId: session.sessionId,
  };
}

export async function signUpUser(
  input: {
    email: string;
    username: string;
    fullName: string;
    password: string;
  },
  meta?: { userAgent?: string | null },
) {
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

  const tokens = await issueTokens({
    userId,
    email,
    username,
    workspaceId,
    role,
    userAgent: meta?.userAgent,
  });

  return {
    ...tokens,
    user: mapUser({ _id: result.insertedId, ...newUser, password: hashedPassword }),
  };
}

export async function signInUser(
  identifierRaw: string,
  password: string,
  meta?: { userAgent?: string | null },
) {
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

  const { comparePassword } = await import("@/lib/auth");
  const valid = await comparePassword(password, user.password as string);
  if (!valid) {
    throw AppError.unauthorized("Invalid credentials");
  }

  const userId = String(user._id);
  const { workspaceId, role } = await ensurePersonalWorkspace(userId, user.username as string);

  const tokens = await issueTokens({
    userId,
    email: user.email as string,
    username: user.username as string,
    workspaceId,
    role,
    userAgent: meta?.userAgent,
  });

  return {
    ...tokens,
    user: mapUser(user as unknown as Record<string, unknown>),
  };
}

export async function refreshAuthSession(rawRefresh: string, userAgent?: string | null) {
  const rotated = await rotateSession(rawRefresh, userAgent);
  const users = await usersCollection();
  const user = await users.findOne({ _id: parseObjectId(rotated.userId, "userId") });
  if (!user) {
    throw AppError.unauthorized("User no longer exists");
  }

  const accessToken = await generateAccessToken({
    userId: rotated.userId,
    email: user.email,
    username: user.username,
    workspaceId: rotated.workspaceId,
    role: rotated.role,
    sessionId: rotated.sessionId,
  });

  return {
    token: accessToken,
    refreshToken: rotated.refreshToken,
    user: mapUser(user as unknown as Record<string, unknown>),
    workspaceId: rotated.workspaceId,
  };
}

export async function logoutSession(rawRefresh: string | undefined) {
  if (rawRefresh) {
    await revokeSessionByRefresh(rawRefresh);
  }
}

export async function switchActiveWorkspace(params: {
  userId: string;
  email: string;
  username: string;
  sessionId: string | undefined;
  workspaceId: string;
}) {
  const membership = await requireWorkspaceMember(params.userId, params.workspaceId, "member");

  if (params.sessionId && ObjectId.isValid(params.sessionId)) {
    await updateSessionWorkspace(params.sessionId, params.workspaceId, membership.role);
  }

  const accessToken = await generateAccessToken({
    userId: params.userId,
    email: params.email,
    username: params.username,
    workspaceId: params.workspaceId,
    role: membership.role,
    sessionId: params.sessionId && ObjectId.isValid(params.sessionId) ? params.sessionId : "none",
  });

  return {
    token: accessToken,
    workspaceId: params.workspaceId,
    role: membership.role,
  };
}

export async function getCurrentUser(userId: string) {
  const users = await usersCollection();
  const user = await users.findOne({ _id: parseObjectId(userId, "userId") });
  if (!user) throw AppError.notFound("User not found");
  return mapUser(user as unknown as Record<string, unknown>);
}

export { listWorkspacesForUser, revokeAllUserSessions };
