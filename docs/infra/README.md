# Infrastructure Baseline

## Terraform Layout

```
infra/
  main.tf
  modules/
    network/
    observability/
    storage/
  envs/
    dev/
      main.tfvars
    stage/
      main.tfvars
    prod/
      main.tfvars
```

## Setup Steps

1. Install Terraform 1.6+ and AWS/Azure CLIs (provider TBD) with credentials configured.
2. Run `terraform init` at repo root (`infra/`).
3. For each environment, run `terraform workspace select <env>` (or use separate state files) and apply with `terraform apply -var-file=envs/<env>/main.tfvars`.

## Modules To Implement

- **Network**: VPC + subnets with residency tags, security groups for services.
- **Storage**: S3 buckets (PII, media, logs) with lifecycle + encryption, Postgres clusters, Redis.
- **Observability**: OpenTelemetry collector ECS service, Prometheus/Grafana stack.
- **Secrets**: Integrate with AWS Secrets Manager / Azure Key Vault via module outputs.

## Policies

- Tag all resources with `env`, `data_classification`, and `owner`.
- Keep state files in encrypted backend (e.g., S3 + DynamoDB lock table).

## CI/CD

- GitHub Actions workflow `infra.yml`:
  1. `terraform fmt -check`
  2. `terraform validate`
  3. `terraform plan -var-file=envs/${{ env.ENV }}/main.tfvars`
  4. Manual approval step for `apply` on stage/prod.

## Observability Artefacts

- Store Otel collector configs under `observability/otel/`.
- Grafana dashboards JSON under `observability/dashboards/`.
- Reference these paths inside Terraform modules when provisioning.
