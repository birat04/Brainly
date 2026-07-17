import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import { createBillingPortalSession } from "@/lib/services/billing.service";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const data = await createBillingPortalSession({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    });
    return ok({ data });
  });
}
