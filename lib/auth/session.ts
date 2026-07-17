import { createHash, randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import { AppError } from "@/lib/errors";
import { parseObjectId } from "@/lib/object-id";
import { sessionsCollection } from "@/lib/repos/collections";
import type { WorkspaceRole } from "@/lib/repos/types";
import { REFRESH_MAX_AGE } from "@/lib/auth/constants";

export function hashRefreshToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export async function createSession(params: {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  userAgent?: string | null;
}) {
  const sessions = await sessionsCollection();
  const rawRefresh = generateRefreshToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_MAX_AGE * 1000);
  const result = await sessions.insertOne({
    userId: parseObjectId(params.userId, "userId"),
    refreshTokenHash: hashRefreshToken(rawRefresh),
    workspaceId: parseObjectId(params.workspaceId, "workspaceId"),
    role: params.role,
    userAgent: params.userAgent ?? null,
    expiresAt,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
  } as never);

  return {
    sessionId: result.insertedId.toString(),
    refreshToken: rawRefresh,
    workspaceId: params.workspaceId,
    role: params.role,
  };
}

export async function rotateSession(rawRefresh: string, userAgent?: string | null) {
  const sessions = await sessionsCollection();
  const hash = hashRefreshToken(rawRefresh);
  const existing = await sessions.findOne({
    refreshTokenHash: hash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!existing) {
    throw AppError.unauthorized("Invalid or expired session");
  }

  await sessions.updateOne(
    { _id: existing._id },
    { $set: { revokedAt: new Date(), updatedAt: new Date() } },
  );

  const rawNew = generateRefreshToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_MAX_AGE * 1000);
  const inserted = await sessions.insertOne({
    userId: existing.userId,
    refreshTokenHash: hashRefreshToken(rawNew),
    workspaceId: existing.workspaceId,
    role: existing.role,
    userAgent: userAgent ?? existing.userAgent ?? null,
    expiresAt,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
  } as never);

  return {
    sessionId: inserted.insertedId.toString(),
    refreshToken: rawNew,
    userId: existing.userId.toString(),
    workspaceId: existing.workspaceId.toString(),
    role: existing.role,
  };
}

export async function revokeSessionByRefresh(rawRefresh: string) {
  const sessions = await sessionsCollection();
  await sessions.updateOne(
    { refreshTokenHash: hashRefreshToken(rawRefresh), revokedAt: null },
    { $set: { revokedAt: new Date(), updatedAt: new Date() } },
  );
}

export async function revokeAllUserSessions(userId: string) {
  const sessions = await sessionsCollection();
  await sessions.updateMany(
    { userId: parseObjectId(userId, "userId"), revokedAt: null },
    { $set: { revokedAt: new Date(), updatedAt: new Date() } },
  );
}

export async function updateSessionWorkspace(
  sessionId: string,
  workspaceId: string,
  role: WorkspaceRole,
) {
  const sessions = await sessionsCollection();
  await sessions.updateOne(
    { _id: new ObjectId(sessionId), revokedAt: null },
    {
      $set: {
        workspaceId: parseObjectId(workspaceId, "workspaceId"),
        role,
        updatedAt: new Date(),
      },
    },
  );
}
