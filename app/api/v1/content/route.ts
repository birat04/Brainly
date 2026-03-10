import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { ensureIndexes } from '@/lib/db';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  // indexes are created on signup/post; no need to run every GET
  const client = await getMongoClient();
  const db = client.db();
  const docs = await db.collection('contents').find().toArray();
  const contents = docs.map((d) => ({
    id: d._id.toString(),
    title: d.title,
    type: d.type,
    link: d.link,
    tags: d.tags,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
  return NextResponse.json(contents);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      title: z.string().min(1),
      type: z.string().min(1),
      link: z.string().url().optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsed.error.format() }, { status: 400 });
    }
    const { title, type, link } = parsed.data;
    await ensureIndexes();
    const client = await getMongoClient();
    const db = client.db();
    const now = new Date().toISOString();
    const result = await db.collection('contents').insertOne({ title, type, link, tags: [], createdAt: now, updatedAt: now });
    const content = {
      id: result.insertedId.toString(),
      title,
      type,
      link,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    return NextResponse.json(content);
  } catch (e) {
    return NextResponse.json({ message: 'Failed to create content' }, { status: 500 });
  }
}
