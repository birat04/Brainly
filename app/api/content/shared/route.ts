import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { listSharedContent } from "@/lib/services/content.service";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const data = await listSharedContent(ctx.userId, ctx.workspaceId);
    return ok({ data });
  });
}
