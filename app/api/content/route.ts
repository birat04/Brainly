import type { NextRequest } from "next/server";
import { created, handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { createContent, listContent } from "@/lib/services/content.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";
import { createContentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    await enforceRateLimit(request, {
      prefix: "content:list",
      limit: 120,
      windowMs: 60_000,
      identity: ctx.userId,
    });
    const { searchParams } = new URL(request.url);
    const data = await listContent({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      type: searchParams.get("type"),
      search: searchParams.get("search"),
    });
    return ok({ data });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const ctx = await requireAuthContext(request);
    await enforceRateLimit(request, {
      prefix: "content:create",
      limit: 30,
      windowMs: 60_000,
      identity: ctx.userId,
    });
    const validated = createContentSchema.parse(await request.json());
    const data = await createContent({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      ...validated,
    });
    return created({ data, message: "Content created successfully" });
  });
}
