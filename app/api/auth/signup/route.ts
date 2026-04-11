import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getDatabase } from "@/lib/db";
import { generateToken, hashPassword } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations";
import { mapUser } from "@/lib/mappers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = signUpSchema.parse(body);
    const { email, username, fullName, password } = validated;

    const db = await getDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: existing.email === email ? "Email already registered" : "Username already taken",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();
    const newUser = {
      email,
      username,
      fullName,
      password: hashedPassword,
      avatar: null as string | null,
      bio: null as string | null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await users.insertOne(newUser);
    const token = await generateToken({
      userId: result.insertedId.toString(),
      email,
      username,
    });

    const safe = mapUser({ _id: result.insertedId, ...newUser, password: hashedPassword });

    return NextResponse.json(
      {
        success: true,
        token,
        user: safe,
        message: "Account created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Signup error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
