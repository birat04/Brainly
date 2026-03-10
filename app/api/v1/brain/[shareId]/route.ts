import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  context: any
) {
  const { shareId } = (await context.params) as { shareId: string };
  if (!shareId) {
    return NextResponse.json({ message: 'Missing shareId' }, { status: 400 });
  }
  const client = await getMongoClient();
  const db = client.db();
  const doc = await db.collection('shares').findOne({ _id: new ObjectId(shareId) });
  if (!doc) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  const share = { id: doc._id.toString(), content: doc.content, createdAt: doc.createdAt };
  return NextResponse.json(share);
}
