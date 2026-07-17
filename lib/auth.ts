import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { JWTPayload } from "@/lib/auth/types";

export type { JWTPayload, WorkspaceRole } from "@/lib/auth/types";

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

/** @deprecated Prefer generateAccessToken from lib/auth/access-token */
export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecretKeyBytes());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKeyBytes());
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string | null | undefined,
): Promise<boolean> {
  if (hashedPassword == null || typeof hashedPassword !== "string") {
    return false;
  }
  const hash = hashedPassword.trim();
  if (!hash.startsWith("$2")) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

export function generateShareId(): string {
  return randomBytes(12).toString("base64url");
}
