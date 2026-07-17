import type { NextRequest } from "next/server";
import { created, handleRoute } from "@/lib/api/http";
import { applyAuthCookies } from "@/lib/auth/cookies";
import { signUpUser } from "@/lib/services/auth.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, { prefix: "auth:signup", limit: 10, windowMs: 60_000 });
    const body = await request.json();
    const validated = signUpSchema.parse(body);
    const result = await signUpUser(
      {
        email: validated.email,
        username: validated.username,
        fullName: validated.fullName,
        password: validated.password,
      },
      { userAgent: request.headers.get("user-agent") },
    );

    const res = created({
      token: result.token,
      user: result.user,
      workspaceId: result.workspaceId,
      message: "Account created successfully",
    });
    return applyAuthCookies(res, {
      accessToken: result.token,
      refreshToken: result.refreshToken,
    });
  });
}
