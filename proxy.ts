import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';



export const runtime = 'nodejs';

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      return NextResponse.next();
    }
  }

  const publicPaths = ['/', '/signin', '/signup', '/api/v1/signin', '/api/v1/signup', '/brain'];
  if (publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/signin';
  return NextResponse.redirect(url);
}
