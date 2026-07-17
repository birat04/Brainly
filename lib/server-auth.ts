import type { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { ensurePersonalWorkspace } from "@/lib/services/workspace.service";

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  const token = bearer || request.cookies.get("token")?.value;
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
    };
  }

  const { workspaceId, role } = await ensurePersonalWorkspace(user.userId, user.username);
  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    workspaceId,
    role,
  };
}
