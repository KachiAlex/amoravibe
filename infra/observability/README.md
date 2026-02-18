# Observability Stack Scaffold

Baseline structure for telemetry pipelines used across environments.

## Components

- `otel-collector/` — OpenTelemetry Collector configuration (ingest traces/logs/metrics).
- `dashboards/` — placeholders for Grafana dashboards and alerting rules.
- `logging/` — Fluent Bit or Vector pipeline definitions (TBD).

## Next Steps

1. Choose primary APM backend (e.g., Grafana Cloud, Honeycomb, or Azure Monitor) and update exporters.
2. Define metric/log pipelines per environment with secret-backed credentials.
3. Add docker-compose manifests for local testing.
