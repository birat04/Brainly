import type { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "@/lib/auth";

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  const token = bearer || request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = token.includes("%") ? decodeURIComponent(token) : token;
  return verifyToken(decoded);
}
