import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ZodError } from "zod";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { changePasswordSchema } from "@/lib/validations";
import { comparePassword, hashPassword } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    const db = await getDatabase();
    const users = db.collection("users");
    const existing = await users.findOne({ _id: new ObjectId(user.userId) });

    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const ok = await comparePassword(validated.currentPassword, existing.password as string);
    if (!ok) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
    }

    const hashed = await hashPassword(validated.newPassword);
    await users.updateOne(
      { _id: new ObjectId(user.userId) },
      { $set: { password: hashed, updatedAt: new Date() } },
    );

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Password change error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
