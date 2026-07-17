import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { createShareLink, patchShare } from "@/lib/services/content.service";

const patchSchema = z.object({
  isPublic: z.boolean(),
  revoke: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { id } = await params;
    const data = await createShareLink(ctx.userId, ctx.workspaceId, id);
    return ok({ data, message: "Share link generated" });
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    const data = await patchShare(ctx.userId, ctx.workspaceId, id, body);
    return ok({ data });
  });
}
