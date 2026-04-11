import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ZodError } from "zod";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { deleteAccountSchema } from "@/lib/validations";
import { comparePassword } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = deleteAccountSchema.parse(body);

    const db = await getDatabase();
    const users = db.collection("users");
    const existing = await users.findOne({ _id: new ObjectId(user.userId) });

    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const ok = await comparePassword(password, existing.password as string);
    if (!ok) {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
    }

    await db.collection("contents").deleteMany({ userId: new ObjectId(user.userId) });
    await users.deleteOne({ _id: new ObjectId(user.userId) });

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Account delete error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
