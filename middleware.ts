import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const authRoutes = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const raw = request.cookies.get("token")?.value;
  const token = raw ? decodeURIComponent(raw) : null;

  const isPublicRoute =
    pathname === "/" ||
    authRoutes.includes(pathname) ||
    pathname.startsWith("/brain");

  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/signin", request.url));
      res.cookies.set("token", "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  if (!isPublicRoute && !pathname.startsWith("/dashboard")) {
    // reserved for future protected non-dashboard routes
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
