import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/server-auth";
import { acceptInvite, getInviteByToken } from "@/lib/services/invite.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    const { token } = await params;
    const data = await getInviteByToken(token);
    return ok({ data });
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const user = await requireAuth(request);
    await enforceRateLimit(request, {
      prefix: "invite:accept",
      limit: 20,
      windowMs: 60_000,
      identity: user.userId,
    });
    const { token } = await params;
    const data = await acceptInvite({
      token,
      userId: user.userId,
      userEmail: user.email,
    });
    return ok({ data, message: "Invite accepted" });
  });
}
