import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload, WorkspaceRole } from "@/lib/auth/types";
import { ACCESS_MAX_AGE } from "@/lib/auth/constants";

export type { JWTPayload, WorkspaceRole };

const encoder = new TextEncoder();

function getSecretKeyBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return encoder.encode("dev-only-jwt-secret-change-me");
    }
    throw new Error('Invalid/Missing environment variable: "JWT_SECRET"');
  }
  return encoder.encode(secret);
}

export async function generateAccessToken(payload: {
  userId: string;
  email: string;
  username: string;
  workspaceId: string;
  role: WorkspaceRole;
  sessionId: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_MAX_AGE}s`)
    .sign(getSecretKeyBytes());
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKeyBytes());
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/** Alias for legacy call sites — same verifier as access tokens. */
export const verifyToken = verifyAccessToken;
