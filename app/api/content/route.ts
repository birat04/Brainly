import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ZodError } from "zod";
import { getDatabase } from "@/lib/db";
import { getUserFromRequest } from "@/lib/server-auth";
import { createContentSchema } from "@/lib/validations";
import { mapContent } from "@/lib/mappers";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const db = await getDatabase();
    const contents = db.collection("contents");

    const query: Record<string, unknown> = { userId: new ObjectId(user.userId) };
    if (type && type !== "all") {
      query.type = type;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const docs = await contents.find(query).sort({ createdAt: -1 }).toArray();
    const data = docs.map((d) => mapContent(d as unknown as Record<string, unknown>));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("List content error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createContentSchema.parse(body);

    const db = await getDatabase();
    const contents = db.collection("contents");
    const now = new Date();

    const doc = {
      userId: new ObjectId(user.userId),
      title: validated.title,
      description: validated.description ?? null,
      type: validated.type,
      tags: validated.tags,
      url: validated.url || null,
      body: validated.body ?? null,
      shareId: null as string | null,
      isPublic: false,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await contents.insertOne(doc);
    const created = mapContent({ _id: result.insertedId, ...doc });

    return NextResponse.json({ success: true, data: created, message: "Content created successfully" }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("Create content error", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
