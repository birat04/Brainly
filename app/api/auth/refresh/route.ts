import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { applyAuthCookies } from "@/lib/auth/cookies";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import { AppError } from "@/lib/errors";
import { refreshAuthSession } from "@/lib/services/auth.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, { prefix: "auth:refresh", limit: 60, windowMs: 60_000 });
    const rawRefresh = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!rawRefresh) {
      throw AppError.unauthorized("No refresh session");
    }

    const result = await refreshAuthSession(rawRefresh, request.headers.get("user-agent"));
    const res = ok({
      token: result.token,
      user: result.user,
      workspaceId: result.workspaceId,
      message: "Session refreshed",
    });
    return applyAuthCookies(res, {
      accessToken: result.token,
      refreshToken: result.refreshToken,
    });
  });
}
