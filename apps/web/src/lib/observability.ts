let _sentry: any = null;
let _initialized = false;

async function ensureSentry() {
  if (_initialized) return;
  _initialized = true;
  if (!process.env.SENTRY_DSN) return;

  try {
    const Sentry = await import('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      // keep tracesSampleRate low by default; can be overridden via env
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    });
    _sentry = Sentry;
    console.info('[observability] Sentry initialized');
  } catch (err) {
    // Don't crash the app if Sentry cannot be imported/initialized
    console.warn('[observability] failed to initialize Sentry', (err as any)?.message ?? String(err));
  }
}

export async function captureException(err: unknown, ctx?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) {
    // fallback to console for environments without SENTRY configured
    console.error('[observability] exception', err, ctx ?? '');
    return;
  }

  await ensureSentry();
  if (!_sentry) return;

  try {
    _sentry.withScope((scope: any) => {
      if (ctx) {
        Object.entries(ctx).forEach(([k, v]) => scope.setExtra(k, v));
      }
      _sentry.captureException(err);
    });
  } catch (e) {
    console.warn('[observability] sentry.captureException failed', (e as any)?.message ?? String(e));
  }
}

export async function captureMessage(message: string, ctx?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) {
    console.info('[observability] message', message, ctx ?? '');
    return;
  }

  await ensureSentry();
  if (!_sentry) return;

  try {
    _sentry.captureMessage(message);
  } catch (e) {
    console.warn('[observability] sentry.captureMessage failed', (e as any)?.message ?? String(e));
  }
}

export async function addBreadcrumb(item: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}) {
  if (!process.env.SENTRY_DSN) {
    // non-blocking console breadcrumb for local/dev
    console.debug('[observability] breadcrumb', item.message, item.data ?? '');
    return;
  }

  await ensureSentry();
  if (!_sentry) return;

  try {
    _sentry.addBreadcrumb({
      message: item.message,
      category: item.category,
      level: item.level ?? 'info',
      data: item.data,
    });
  } catch (e) {
    console.debug('[observability] addBreadcrumb failed', (e as any)?.message ?? String(e));
  }
}
