import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser } from '@/lib/db';
import { corsHeaders, withCors } from '@/lib/cors';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) {
      return withCors(
        NextResponse.json({ message: 'Invalid data', errors: parsed.error.format() }, { status: 400 })
      );
    }
    const { email, password } = parsed.data;

    const result = await authenticateUser(email, password);
    if (!result) {
      return withCors(
        NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      );
    }

    return withCors(NextResponse.json({ token: result.token, user: result.user }));
  } catch (err) {
    return withCors(
      NextResponse.json({ message: 'Failed to sign in' }, { status: 500 })
    );
  }
}

export function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  withCors(res);
  return res;
}
