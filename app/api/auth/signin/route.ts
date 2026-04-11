import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import { signInSchema } from "@/lib/validations";
import { mapUser } from "@/lib/mappers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = signInSchema.parse(body);

    const db = await getDatabase();
    const users = db.collection("users");

    const user = await users.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password as string);
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
