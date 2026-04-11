import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const contents = db.collection("contents");
    const userId = new ObjectId(user.userId);

    const [totalContent, sharedContent, viewsAgg] = await Promise.all([
      contents.countDocuments({ userId }),
      contents.countDocuments({ userId, isPublic: true }),
      contents
        .aggregate<{ total: number }>([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$viewCount" } } },
        ])
        .toArray(),
    ]);

    const totalViews = viewsAgg[0]?.total ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        totalContent,
        sharedContent,
        totalViews,
      },
    });
  } catch (error) {
    console.error("Stats error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
