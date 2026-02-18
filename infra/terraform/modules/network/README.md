# Network Module

Placeholder module establishing networking primitives per cloud provider.

## Inputs

- `cloud` — target provider (`aws` or `azure`).
- `tags` — map of base tags.

## Outputs

- `network_id` — placeholder ID until real resources defined.

## Next Steps

1. Split into provider-specific modules (VPC/VNet, subnets, gateways).
2. Inject CIDR strategies, routing tables, security groups/NSGs.
3. Export subnet IDs and security controls for services.
