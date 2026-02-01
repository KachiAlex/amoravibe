import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Log and return success in dev.
    // eslint-disable-next-line no-console
    console.log('Toggle notification', JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to toggle notification', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
