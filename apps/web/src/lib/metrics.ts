// Lightweight Datadog metrics helper. Uses DogStatsD via `hot-shots` when
// DATADOG_STATSD_HOST/PORT are configured. Otherwise noop functions are returned.

let client: any | null = null;
let initializing = false;

function ensureClient() {
  if (client || initializing) return;
  initializing = true;
  const host = process.env.DATADOG_STATSD_HOST;
  const port = process.env.DATADOG_STATSD_PORT;
  if (host && port) {
    import('hot-shots')
      .then((mod) => {
        const StatsD = (mod as any).default ?? mod;
        client = new StatsD({ host, port: Number(port) });
        console.info('[metrics] Datadog StatsD client initialized', { host, port });
      })
      .catch((err) => {
        console.warn(
          '[metrics] failed to initialize Datadog StatsD client',
          (err as any)?.message ?? String(err)
        );
        client = null;
      })
      .finally(() => {
        initializing = false;
      });
  } else {
    console.info('[metrics] Datadog not configured; metrics are no-ops');
    initializing = false;
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
