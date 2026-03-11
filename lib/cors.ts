import { NextResponse } from 'next/server';


export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}


export function withCors(res: NextResponse) {
  const headers = corsHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value as string);
  }
  return res;
}
