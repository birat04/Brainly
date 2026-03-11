import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';
import { withCors } from '@/lib/cors';



export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      return withCors(NextResponse.next());
    }
  }

  const publicPaths = ['/', '/signin', '/signup', '/api/v1/signin', '/api/v1/signup', '/brain'];
  if (publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return withCors(NextResponse.next());
  }

  const url = request.nextUrl.clone();
  url.pathname = '/signin';
  const res = NextResponse.redirect(url);
  return withCors(res);
}
