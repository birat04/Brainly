import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { ensureIndexes } from '@/lib/db';
import { z } from 'zod';
import { corsHeaders, withCors } from '@/lib/cors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      shareCode: z.string().optional(),
      contentIds: z.array(z.string()).optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return withCors(
        NextResponse.json({ message: 'Invalid data', errors: parsed.error.format() }, { status: 400 })
      );
    }
    const { shareCode, contentIds } = parsed.data;
    let ids = contentIds || [];

    await ensureIndexes();
    const client = await getMongoClient();
    const db = client.db();

    let docs: any[] = [];
    if (ids.length > 0) {
      docs = await db
        .collection('contents')
        .find({ _id: { $in: ids.map((i) => new ObjectId(i)) } })
        .toArray();
    } else {
      docs = await db.collection('contents').find().toArray();
    }
    const content = docs.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      type: d.type,
      link: d.link,
      tags: d.tags,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
    const shareDoc = {
      content,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('shares').insertOne(shareDoc);
    const shareId = result.insertedId.toString();
    const shareLink = `/brain/${shareId}`;
    return withCors(NextResponse.json({ shareId, shareLink }));
  } catch (e) {
    return withCors(
      NextResponse.json({ message: 'Failed to create share' }, { status: 500 })
    );
  }
}

export function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  withCors(res);
  return res;
}
