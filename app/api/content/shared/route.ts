import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { mapContent } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const contents = db.collection("contents");

    const docs = await contents
      .find({
        userId: new ObjectId(user.userId),
        shareId: { $exists: true, $ne: null },
      })
      .sort({ updatedAt: -1 })
      .toArray();

    const data = docs.map((d) => mapContent(d as unknown as Record<string, unknown>));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Shared list error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
