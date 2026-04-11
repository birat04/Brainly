import { SignJWT, jwtVerify, type JWTPayload as JosePayload } from "jose";
import bcrypt from "bcryptjs";

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

export interface JWTPayload extends JosePayload {
  userId: string;
  email: string;
  username: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
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
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateShareId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
