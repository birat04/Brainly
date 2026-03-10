import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, ensureIndexes } from '@/lib/db';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsed.error.format() }, { status: 400 });
    }
    const { email, password, username } = parsed.data;

    await ensureIndexes();

    const { user, token } = await createUser(email, password, username);
    return NextResponse.json({ token, user });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}
