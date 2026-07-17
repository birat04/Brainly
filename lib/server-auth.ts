import type { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "@/lib/auth/access-token";
import { ACCESS_COOKIE, LEGACY_TOKEN_COOKIE } from "@/lib/auth/constants";
import { AppError } from "@/lib/errors";
import { ensurePersonalWorkspace } from "@/lib/services/workspace.service";

export type { JWTPayload };

function readAccessCookie(request: NextRequest): string | null {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (access) return access.includes("%") ? decodeURIComponent(access) : access;
  const legacy = request.cookies.get(LEGACY_TOKEN_COOKIE)?.value;
  if (legacy) return legacy.includes("%") ? decodeURIComponent(legacy) : legacy;
  return null;
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  const token = bearer || readAccessCookie(request);
  if (!token) return null;

  const decoded = token.includes("%") ? decodeURIComponent(token) : token;
  return verifyToken(decoded);
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const user = await getUserFromRequest(request);
  if (!user?.userId) throw AppError.unauthorized();
  return user;
}

/** Auth + resolve/ensure active workspace (backfills personal workspace for legacy tokens). */
export async function requireAuthContext(request: NextRequest) {
  const user = await requireAuth(request);
  if (user.workspaceId) {
    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      workspaceId: user.workspaceId,
      role: user.role ?? "member",
      sessionId: user.sessionId,
    };
  }

  const { workspaceId, role } = await ensurePersonalWorkspace(user.userId, user.username);
  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    workspaceId,
    role,
    sessionId: user.sessionId,
  };
}
