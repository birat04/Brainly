import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { generateShareId } from "@/lib/auth";
import { mapContent } from "@/lib/mappers";

const patchSchema = z.object({
  isPublic: z.boolean(),
  revoke: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const db = await getDatabase();
    const contents = db.collection("contents");

    const content = await contents.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    });

    if (!content) {
      return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 });
    }

    let shareId = content.shareId as string | null | undefined;
    if (!shareId) {
      shareId = generateShareId();
      await contents.updateOne(
        { _id: new ObjectId(id) },
        { $set: { shareId, isPublic: true, updatedAt: new Date() } },
      );
    } else if (!content.isPublic) {
      await contents.updateOne({ _id: new ObjectId(id) }, { $set: { isPublic: true, updatedAt: new Date() } });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/brain/${shareId}`;

    return NextResponse.json({
      success: true,
      data: { shareId, url, isPublic: true },
      message: "Share link generated",
    });
  } catch (error) {
    console.error("Share POST error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = patchSchema.parse(await request.json());

    const db = await getDatabase();
    const contents = db.collection("contents");

    const content = await contents.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    });

    if (!content) {
      return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 });
    }

    if (body.revoke) {
      await contents.updateOne(
        { _id: new ObjectId(id) },
        { $set: { shareId: null, isPublic: false, updatedAt: new Date() } },
      );
    } else {
      const update: Record<string, unknown> = { isPublic: body.isPublic, updatedAt: new Date() };
      if (body.isPublic && !content.shareId) {
        update.shareId = generateShareId();
      }
      if (!body.isPublic) {
        update.isPublic = false;
      }
      await contents.updateOne({ _id: new ObjectId(id) }, { $set: update });
    }

    const updated = await contents.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      success: true,
      data: mapContent(updated as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error("Share PATCH error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
