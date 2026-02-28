import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.search;
  return NextResponse.redirect(new URL(`/auth/error${params}`, url.origin));
}
