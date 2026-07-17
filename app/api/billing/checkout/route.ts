import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { createCheckoutSession } from "@/lib/services/billing.service";

const schema = z.object({
  plan: z.enum(["pro", "enterprise"]),
});

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const { plan } = schema.parse(await request.json());
    const data = await createCheckoutSession({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      plan,
    });
    return ok({ data });
  });
}
