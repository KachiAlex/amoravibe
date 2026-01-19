# Identity Service

NestJS service responsible for user identity, verification workflows, and orientation-aware policy enforcement.

## Roadmap Placeholders

### KYC & Biometric Verification

- [ ] Integrate with external KYC provider (e.g., Persona, Onfido) for document + selfie flows.
- [ ] Implement liveness checks and store verification evidence references.
- [ ] Add retry/backoff logic and manual review queue linkage.
- [x] Provide webhook endpoint + service to process provider callbacks.

### Device Fingerprinting

- [x] Define ingestion endpoint for device fingerprint SDK telemetry.
- [ ] Persist device hashes and correlate with multi-account detection signals.
- [ ] Emit alerts to Trust service when suspicious device reuse detected.

### Testing

- [ ] Add e2e test harness simulating KYC callback success/failure.
- [x] Add unit tests for OrientationPolicyService to cover hetero vs LGBTQ pools.
- [x] Add contract tests ensuring verification state transitions update UserService profiles.
