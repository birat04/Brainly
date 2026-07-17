import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleRoute, ok } from "@/lib/api/http";
import { setAccessCookieOnly } from "@/lib/auth/cookies";
import { requireAuthContext } from "@/lib/server-auth";
import { switchActiveWorkspace } from "@/lib/services/auth.service";
import { listWorkspacesForUser } from "@/lib/services/workspace.service";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const data = await listWorkspacesForUser(ctx.userId);
    return ok({ data, activeWorkspaceId: ctx.workspaceId, role: ctx.role });
  });
}

const switchSchema = z.object({
  workspaceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { workspaceId } = switchSchema.parse(await request.json());
    const result = await switchActiveWorkspace({
      userId: ctx.userId,
      email: ctx.email,
      username: ctx.username,
      sessionId: ctx.sessionId,
      workspaceId,
    });

    const res = ok({
      token: result.token,
      workspaceId: result.workspaceId,
      role: result.role,
      message: "Workspace switched",
    });
    return setAccessCookieOnly(res, result.token);
  });
}
