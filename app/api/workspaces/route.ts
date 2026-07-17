import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { listWorkspacesForUser } from "@/lib/services/workspace.service";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const data = await listWorkspacesForUser(ctx.userId);
    return ok({ data, activeWorkspaceId: ctx.workspaceId });
  });
}
