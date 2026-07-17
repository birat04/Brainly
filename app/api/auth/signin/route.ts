import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { applyAuthCookies } from "@/lib/auth/cookies";
import { signInUser } from "@/lib/services/auth.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";
import { signInSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, { prefix: "auth:signin", limit: 20, windowMs: 60_000 });
    const parsed = signInSchema.parse(await request.json());
    const result = await signInUser(parsed.identifier, parsed.password, {
      userAgent: request.headers.get("user-agent"),
    });

    const res = ok({
      token: result.token,
      user: result.user,
      workspaceId: result.workspaceId,
      message: "Signed in successfully",
    });
    return applyAuthCookies(res, {
      accessToken: result.token,
      refreshToken: result.refreshToken,
    });
  });
}
