import { NextResponse } from 'next/server';
import { BACKEND_CONFIG, getBackendUrl } from '@/lib/backend-config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, action, highlight } = body;

    // Log locally for debugging
    // eslint-disable-next-line no-console
    console.log('User action:', JSON.stringify({ senderId, receiverId, action }).slice(0, 500));

    // Forward to backend if enabled
    if (BACKEND_CONFIG.USE_REAL_BACKEND && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
      try {
        const backendUrl = getBackendUrl('/matches/action');
        const res = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId, receiverId, action, highlight }),
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, data });
        }

        // eslint-disable-next-line no-console
        console.error('Backend action failed:', res.status, await res.text());
        // Fall through to local stub success
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to reach backend for action:', err);
        // Fall through to local stub success
      }
    }

    // Local stub success (for development without backend)
    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to process user action', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
