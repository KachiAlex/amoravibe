// Lightweight Datadog metrics helper. Uses DogStatsD via `hot-shots` when
// DATADOG_STATSD_HOST/PORT are configured. Otherwise noop functions are returned.

let client: any | null = null;
let initialized = false;

function ensureClient() {
  if (initialized) return;
  initialized = true;
  const host = process.env.DATADOG_STATSD_HOST;
  const port = process.env.DATADOG_STATSD_PORT;
  if (host && port) {
    try {
      const StatsD = require('hot-shots');
      client = new StatsD({ host, port: Number(port) });
      console.info('[metrics] Datadog StatsD client initialized', { host, port });
    } catch (err) {
      console.warn(
        '[metrics] failed to initialize Datadog StatsD client',
        (err as any)?.message ?? String(err)
      );
      client = null;
    }
  } else {
    console.info('[metrics] Datadog not configured; metrics are no-ops');
  }
}

export function increment(name: string, tags?: string[]) {
  ensureClient();
  if (client) {
    client.increment(name, 1, tags);
  }
}

export function gauge(name: string, value: number, tags?: string[]) {
  ensureClient();
  if (client) {
    client.gauge(name, value, tags);
  }
}

export function histogram(name: string, value: number, tags?: string[]) {
  ensureClient();
  if (client) {
    client.histogram(name, value, tags);
  }
}

export function timing(name: string, ms: number, tags?: string[]) {
  ensureClient();
  if (client) {
    client.timing(name, ms, tags);
  }
}
