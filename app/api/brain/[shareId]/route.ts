import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

type Params = { params: Promise<{ shareId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { shareId } = await params;
    const db = await getDatabase();
    const contents = db.collection("contents");

    const content = await contents.findOne({
      shareId,
      isPublic: true,
    });

    if (!content) {
      return NextResponse.json({ success: false, message: "Content not found or not public" }, { status: 404 });
    }

    await contents.updateOne({ _id: content._id }, { $inc: { viewCount: 1 } });

    const users = db.collection("users");
    const author = await users.findOne(
      { _id: content.userId },
      { projection: { password: 0, email: 0 } },
    );

    const payload = {
      id: String(content._id),
      title: content.title,
      description: content.description,
      type: content.type,
      tags: content.tags,
      url: content.url,
      body: content.body,
      viewCount: (content.viewCount as number) + 1,
      createdAt:
        content.createdAt instanceof Date ? content.createdAt.toISOString() : content.createdAt,
      author: author
        ? {
            username: author.username,
            fullName: author.fullName,
            avatar: author.avatar,
          }
        : null,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error("Public brain error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
