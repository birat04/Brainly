import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import { logoutSession } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const rawRefresh = request.cookies.get(REFRESH_COOKIE)?.value;
    await logoutSession(rawRefresh);
    const res = ok({ message: "Logged out" });
    return clearAuthCookies(res);
  });
}
