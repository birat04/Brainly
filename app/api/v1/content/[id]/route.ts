import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { corsHeaders, withCors } from '@/lib/cors';

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const { id } = (await context.params) as { id: string };
  if (!id) {
    return withCors(
      NextResponse.json({ message: 'Missing ID' }, { status: 400 })
    );
  }
  const client = await getMongoClient();
  const db = client.db();
  const result = await db.collection('contents').deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return withCors(
      NextResponse.json({ message: 'Not found' }, { status: 404 })
    );
  }
  return withCors(NextResponse.json({ success: true }));
}

export function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  withCors(res);
  return res;
}
