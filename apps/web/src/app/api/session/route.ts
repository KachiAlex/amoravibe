import { NextResponse } from 'next/server';
import { getSession, setSession, clearSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({ userId: session?.userId || null });
  } catch (error) {
    console.error('Failed to get session', error);
    return NextResponse.json({ userId: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId || typeof userId !== 'string') {
      console.warn('Session POST: userId validation failed', { userId });
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    await setSession({ userId });
    console.info('Session set successfully', { userId });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Failed to set Lovedate session', error);
    return NextResponse.json({ message: 'Unable to persist session' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearSession();
    return NextResponse.json({ status: 'cleared' });
  } catch (error) {
    console.error('Failed to clear Lovedate session', error);
    return NextResponse.json({ message: 'Unable to clear session' }, { status: 500 });
  }
}
