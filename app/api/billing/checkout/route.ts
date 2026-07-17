import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { createCheckoutSession } from "@/lib/services/billing.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  plan: z.enum(["pro", "enterprise"]),
});

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const ctx = await requireAuthContext(request);
    await enforceRateLimit(request, {
      prefix: "billing:checkout",
      limit: 10,
      windowMs: 60_000,
      identity: ctx.userId,
    });
    const { plan } = schema.parse(await request.json());
    const data = await createCheckoutSession({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      plan,
    });
    return ok({ data });
  });
}
