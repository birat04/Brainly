import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import { signInSchema } from "@/lib/validations";
import { mapUser } from "@/lib/mappers";
import { normalizeLoginIdentifier } from "@/lib/utils";
import { findUserByLogin } from "@/lib/find-user-by-login";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signInSchema.parse(body);
    const identifier = normalizeLoginIdentifier(parsed.identifier);
    const password = parsed.password;

    const db = await getDatabase();
    const users = db.collection("users");

    const user = await findUserByLogin(users, identifier);

    if (!user) {
      if (process.env.NODE_ENV === "development") {
        const count = await users.countDocuments();
        const sample = await users.findOne({}, { projection: { username: 1, email: 1 } });
        console.warn(
          "[auth/signin] No user for identifier:",
          identifier.slice(0, 64),
          "| users count:",
          count,
          sample ? `| example doc: username=${String(sample.username)} email=${String(sample.email)}` : "",
        );
      }
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password as string);
    if (!valid && process.env.NODE_ENV === "development") {
      console.warn("[auth/signin] Password mismatch for user id:", String(user._id));
    }
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = await generateToken({
      userId: (user._id as ObjectId).toString(),
      email: user.email as string,
      username: user.username as string,
    });

    const safe = mapUser(user as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      token,
      user: safe,
      message: "Signed in successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Signin error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
