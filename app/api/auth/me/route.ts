import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/server-auth";
import { getCurrentUser } from "@/lib/services/auth.service";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const payload = await requireAuth(request);
    const data = await getCurrentUser(payload.userId);
    return ok({ data });
  });
}
