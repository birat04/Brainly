import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ZodError } from "zod";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { updateProfileSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    const db = await getDatabase();
    const users = db.collection("users");

    if (validated.username && validated.username !== user.username) {
      const exists = await users.findOne({ username: validated.username });
      if (exists) {
        return NextResponse.json({ success: false, message: "Username already taken" }, { status: 400 });
      }
    }

    const updateDoc: Record<string, unknown> = {
      fullName: validated.fullName,
      bio: validated.bio ?? null,
      updatedAt: new Date(),
    };

    if (validated.username) {
      updateDoc.username = validated.username;
    }

    if (validated.avatar !== undefined) {
      updateDoc.avatar = validated.avatar || null;
    }

    await users.updateOne({ _id: new ObjectId(user.userId) }, { $set: updateDoc });

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Profile update error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
