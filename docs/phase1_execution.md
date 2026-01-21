# Phase 1 — Repository & Infrastructure Foundations

## Objectives

- Keep monorepo developer experience consistent across services.
- Ensure IaC + observability baselines are reproducible for dev/stage/prod.
- Provide artifacts needed for downstream identity/profile teams.

## Task Breakdown

### 1. Monorepo Hygiene & Tooling

- [ ] Document pnpm/Turbo conventions (workspace scripts, caching, CI) in `docs/engineering.md`.
- [ ] Add automated lint/format pipelines in CI (GitHub Actions) mirroring Husky hooks.
- [ ] Introduce dependency graph checks to prevent circular references across packages.

### 2. Infrastructure-as-Code Baseline

- [ ] Expand Terraform modules to include:
  - VPC + subnet blueprints per region (Africa, US, EU) with residency tags.
  - Secrets Manager / Vault integration for service creds.
  - S3 buckets with PII classification + lifecycle rules.
- [ ] Add environment-specific tfvars and a README describing bootstrap commands.
- [ ] Create automated plan/apply pipeline with manual approval for prod.

### 3. Observability Stack

- [ ] Define OpenTelemetry collector configs for NestJS services (identity now, profile later).
- [ ] Provision log aggregation (e.g., Loki/ELK) and metrics (Prometheus) via Terraform modules.
- [ ] Publish dashboard templates (Grafana) for onboarding funnel, API latency, error budget.

### 4. Developer Environments

- [ ] Provide Docker Compose scripts for local dependencies (Postgres, Redis, mock KYC service).
- [ ] Create `make dev` (or npm script) to spin up identity service + frontend site with required env vars.
- [ ] Document onboarding for new contributors (access to secrets, running tests, linting).

## Deliverables

1. Updated docs (`docs/engineering.md`, `docs/infra/README.md`) describing tooling/IaC.
2. Terraform modules committed with sample tfvars and CI pipelines.
3. Grafana dashboards JSON + Otel configs stored under `observability/`.
4. Developer experience scripts tested and referenced in README.
