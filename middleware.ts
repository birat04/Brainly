import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';

// run middleware in Node.js runtime (not edge) so we can use jsonwebtoken/bcrypt etc.
export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  // protect dashboard and API routes
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      // token valid, proceed
      return NextResponse.next();
    }
  }

  // if request is for public pages, allow
  const publicPaths = ['/', '/signin', '/signup', '/api/v1/signin', '/api/v1/signup', '/brain'];
  if (publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // otherwise redirect to signin
  const url = request.nextUrl.clone();
  url.pathname = '/signin';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/v1/content/:path*',
    '/api/v1/brain/share',
    '/api/v1/brain/[shareId]',
  ],
};
