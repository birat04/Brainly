import type { NextRequest } from "next/server";
import { created, handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import {
  createContent,
  listContent,
} from "@/lib/services/content.service";
import { createContentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
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
    const ctx = await requireAuthContext(request);
    const validated = createContentSchema.parse(await request.json());
    const data = await createContent({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      ...validated,
    });
    return created({ data, message: "Content created successfully" });
  });
}
