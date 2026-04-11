import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { mapUser } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: mapUser(user as Record<string, unknown>),
    });
  } catch (error) {
    console.error("Auth me error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
