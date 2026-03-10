import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser } from '@/lib/db';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsed.error.format() }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const result = await authenticateUser(email, password);
    if (!result) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ token: result.token, user: result.user });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to sign in' }, { status: 500 });
  }
}
