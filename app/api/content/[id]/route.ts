import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { deleteContent, getContentById, updateContent } from "@/lib/services/content.service";
import { updateContentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { id } = await params;
    const data = await getContentById(ctx.userId, ctx.workspaceId, id);
    return ok({ data });
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { id } = await params;
    const validated = updateContentSchema.parse(await request.json());
    const data = await updateContent(ctx.userId, ctx.workspaceId, id, validated);
    return ok({ data, message: "Content updated successfully" });
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { id } = await params;
    await deleteContent(ctx.userId, ctx.workspaceId, id);
    return ok({ message: "Content deleted successfully" });
  });
}
