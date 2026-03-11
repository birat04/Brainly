import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { corsHeaders, withCors } from '@/lib/cors';

export async function GET(
  req: NextRequest,
  context: any
) {
  const { shareId } = (await context.params) as { shareId: string };
  if (!shareId) {
    return withCors(
      NextResponse.json({ message: 'Missing shareId' }, { status: 400 })
    );
  }
  const client = await getMongoClient();
  const db = client.db();
  const doc = await db.collection('shares').findOne({ _id: new ObjectId(shareId) });
  if (!doc) {
    return withCors(
      NextResponse.json({ message: 'Not found' }, { status: 404 })
    );
  }
  const share = { id: doc._id.toString(), content: doc.content, createdAt: doc.createdAt };
  return withCors(NextResponse.json(share));
}

export function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  withCors(res);
  return res;
}
