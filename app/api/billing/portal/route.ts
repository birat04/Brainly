import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { createBillingPortalSession } from "@/lib/services/billing.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const ctx = await requireAuthContext(request);
    await enforceRateLimit(request, {
      prefix: "billing:portal",
      limit: 20,
      windowMs: 60_000,
      identity: ctx.userId,
    });
    const data = await createBillingPortalSession({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });
    return ok({ data });
  });
}
