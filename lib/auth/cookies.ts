import type { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  LEGACY_TOKEN_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from "@/lib/auth/constants";

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

export function applyAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  const secure = cookieSecure();
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
  res.cookies.set(LEGACY_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(LEGACY_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export function setAccessCookieOnly(res: NextResponse, accessToken: string) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  return res;
}
