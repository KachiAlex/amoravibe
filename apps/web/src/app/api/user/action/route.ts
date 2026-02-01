import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Local dev: log and return success. Real backend should persist actions.
    // eslint-disable-next-line no-console
    console.log('User action:', JSON.stringify(body).slice(0, 1000));
    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to process user action', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
