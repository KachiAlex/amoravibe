import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMessages, postMessage } from '@/lib/dev-data';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const data = getMessages(session.userId);
  return NextResponse.json({ messages: data });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  const created = postMessage(session.userId, { to: body.to, text: body.text });
  return NextResponse.json({ message: created }, { status: 201 });
}
