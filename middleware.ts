import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/access-token";
import {
  ACCESS_COOKIE,
  LEGACY_TOKEN_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth/constants";

const authRoutes = ["/signin", "/signup"];

async function readSessionHints(request: NextRequest) {
  const accessRaw =
    request.cookies.get(ACCESS_COOKIE)?.value || request.cookies.get(LEGACY_TOKEN_COOKIE)?.value;
  const access = accessRaw
    ? accessRaw.includes("%")
      ? decodeURIComponent(accessRaw)
      : accessRaw
    : null;
  const hasRefresh = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);

  const payload = access ? await verifyAccessToken(access) : null;
  return { payload, hasRefresh };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const { payload, hasRefresh } = await readSessionHints(request);
  const isAuthed = Boolean(payload) || hasRefresh;

  const isPublicRoute =
    pathname === "/" ||
    authRoutes.includes(pathname) ||
    pathname.startsWith("/brain") ||
    pathname.startsWith("/invite");

  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthed) {
      const res = NextResponse.redirect(new URL("/signin", request.url));
      res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
      res.cookies.set(LEGACY_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
