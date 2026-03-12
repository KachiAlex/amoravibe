/**
 * Performance Metrics API Route
 * Receives Web Vitals from client-side tracking
 * 
 * Usage: POST /api/metrics
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log to console (in production, send to analytics service)
    console.log('[API] Received Web Vital:', {
      metric: body.metric_name,
      value: body.metric_value,
      rating: body.metric_rating,
      url: body.page_url,
      timestamp: body.timestamp,
    });

    // TODO: Send to analytics service (Mixpanel, Segment, etc.)
    // Example:
    // await analytics.track('web_vital', {
    //   metric_name: body.metric_name,
    //   metric_value: body.metric_value,
    //   metric_rating: body.metric_rating,
    //   page_url: body.page_url,
    //   timestamp: body.timestamp,
    // });

    return Response.json(
      { success: true, message: 'Metric received' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error processing metric:', error);
    return Response.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}

// Also support GET for health check
export async function GET() {
  return Response.json(
    { status: 'metrics-service-ok' },
    { status: 200 }
  );
}
