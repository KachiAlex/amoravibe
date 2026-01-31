import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const upstreamBase = (
  process.env.TRUST_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_TRUST_API_URL ||
  'http://localhost:4001/api/v1'
).replace(/\/$/, '');

/**
 * Mock response for onboarding (identity service lambda not working on Vercel)
 * TODO: Remove this mock once identity service is fixed for serverless
 */
function getMockOnboardingResponse() {
  return {
    success: true,
    message: 'Onboarding completed successfully (mock response)',
    userId: 'user-' + Math.random().toString(36).slice(2, 11),
    redirectUrl: '/dashboard',
  };
}

/**
 * Proxy for POST /api/trust/onboarding
 * Currently returns mock response (identity service lambda timeout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.info('[Trust API] POST /onboarding received');

    // For now, return mock response to unblock onboarding flow
    // TODO: Replace with actual identity service call when lambda is fixed
    const mockResponse = getMockOnboardingResponse();

    console.info('[Trust API] POST /onboarding ->', 'mock response (200)');
    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error('[Trust API] Onboarding error:', error);
    return NextResponse.json({ message: 'Failed to process onboarding' }, { status: 503 });
  }
}

/**
 * Proxy for GET /api/trust/onboarding/status
 * Currently returns mock response
 */
export async function GET(request: NextRequest) {
  try {
    console.info('[Trust API] GET /onboarding/status received');

    // Return mock status response to unblock onboarding checks
    return NextResponse.json(
      {
        success: true,
        status: 'completed',
        message: 'Onboarding status (mock response)',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Trust API] Onboarding status error:', error);
    return NextResponse.json({ message: 'Failed to check onboarding status' }, { status: 503 });
  }
}
