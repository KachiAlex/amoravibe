import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // In local dev we just log and return success.
    // Real implementation should validate and batch/store telemetry.
    // eslint-disable-next-line no-console
    console.log('Telemetry impressions:', JSON.stringify(body).slice(0, 1000));
    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to process telemetry impression', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
