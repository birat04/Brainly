import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ZodError } from "zod";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { updateContentSchema } from "@/lib/validations";
import { mapContent } from "@/lib/mappers";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const db = await getDatabase();
    const content = await db.collection("contents").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    });

    if (!content) {
      return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: mapContent(content as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error("Get content error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const validated = updateContentSchema.parse(body);

    const db = await getDatabase();
    const contents = db.collection("contents");

    const existing = await contents.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 });
    }

    const update = {
      ...validated,
      updatedAt: new Date(),
    };

    await contents.updateOne({ _id: new ObjectId(id) }, { $set: update });

    const updated = await contents.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      success: true,
      data: mapContent(updated as unknown as Record<string, unknown>),
      message: "Content updated successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Update content error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const db = await getDatabase();
    const result = await db.collection("contents").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Content deleted successfully" });
  } catch (error) {
    console.error("Delete content error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
