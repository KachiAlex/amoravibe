# Phase 0 — Product & Compliance Alignment

## 1. Product Requirements & Personas

### Core Personas

1. **Intentional Heterosexual Daters**
   - Africa-based women seeking stable US partners and vice versa.
   - Pain points: catfishing, fetishization, visa-chasing assumptions.
   - Needs: video-first verification, control over discovery lanes.
2. **Queer & Trans Daters**
   - LGBTQ+ members across Africa/USA needing discreet but affirming spaces.
   - Pain points: harassment in mixed pools, outing risks, policy gaps.
   - Needs: orientation-aware policy engine, safety shortcuts, privacy-first messaging controls.
3. **Culture-Bridge Professionals**
   - Frequent travelers/expats maintaining long-distance ties.
   - Pain points: time zone coordination, trust over distance.
   - Needs: async match reminders, streak/expiry cues, concierge verification.

### Key Flows

- **Dual Discovery Lanes**: Straight vs LGBTQ tabs with mirrored filters, trust gating, and separate ML models to prevent cross-pool leakage.
- **Profile Completion & Trust Hub**: Strength meter, selfie/ID verification, media manager, pronoun/orientation controls.
- **Discovery & Matching Engine**: Preference-aware queues, like/save/snooze actions, safety prompts for flagged behavior.
- **Match Management Inbox**: Active vs archived states, countdown reminders, safety shortcuts (report/block) surfaced inline.
- **Messaging Preview**: Chat workspace unlocks after mutual trust level; includes prompts, emoji/GIF plan, media guardrails.

### Trust Guardrails

- Mandatory legal name + DOB capture during onboarding, stored separately from display profile.
- Orientation/Gender changes require support approval, audit trail logged.
- Device fingerprinting + selfie re-auth required before enabling cross-continental travel mode.
- Safety pledge banner + inline reminders for reporting/blocking.
- Tiered visibility: verified users prioritized; unverified capped in daily reach.

## 2. Legal & Compliance Considerations

| Domain                 | Africa (Nigeria/Kenya)                                                                                                             | USA/EU Residents                                                                                   | Action Items                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **KYC / AML**          | BVN/NIN lookup (Nigeria), Huduma/National ID (Kenya); selfie+ID video per CBN/CBK guidance.                                        | SSN-ITIN optional, driver license/passport; align with FinCEN guidance for money movement add-ons. | Integrate vendor supporting multi-region ID types; store PII in regional buckets.         |
| **Data Residency**     | Host African PII in Lagos/Johannesburg regions; replicate anonymized insights only.                                                | US data in us-east, EU citizens in eu-west per GDPR.                                               | Configure Terraform to pin workloads + S3 buckets by residency tags.                      |
| **LGBTQ+ Protections** | Some African jurisdictions criminalize LGBTQ identities → need opt-in queer lane, encryption at rest, discretion in notifications. | US/EU anti-discrimination laws require equal access, content moderation.                           | Provide neutral billing descriptors, allow alias display names, add "panic" hide toggles. |
| **Privacy / Consent**  | POPIA/GDPR-style consent flows; data export/delete within 30 days.                                                                 | CCPA/CPRA compliance including "Do Not Sell" toggle.                                               | Build centralized consent registry + subject rights automation.                           |
| **Safety Reporting**   | Mandatory escalation path for harassment & violence threats.                                                                       | Maintain records for law enforcement requests with privacy review.                                 | Draft policy SOP, add in-product report forms feeding moderation queue.                   |

## 3. Risk Assessment & Mitigations

| Threat                                         | Likelihood | Impact                              | Mitigation                                                                                                                                 |
| ---------------------------------------------- | ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Impersonation / Catfishing**                 | High       | Trust erosion, fraud                | Multi-factor onboarding (ID + selfie + device check), periodic liveness checks, verified badge gating discovery ranking.                   |
| **Harassment / Hate Speech**                   | High       | Member churn, legal exposure        | AI safety filters, manual moderation queue, block/report shortcuts, queer lane isolation, chat rate limiting.                              |
| **Data Breach / PII Leak**                     | Medium     | Regulatory fines, reputational loss | Encryption at rest/in transit, zero-trust network, secrets rotation, RPO/RTO tested backups, privacy-by-design reviews.                    |
| **Account Takeover**                           | Medium     | Abuse, spam                         | Device fingerprinting, anomaly detection on location/device change, step-up verification for risky actions, refresh tokens with short TTL. |
| **Payment Fraud (future premium)**             | Medium     | Chargebacks, disputes               | 3DSecure-ready processor, risk scoring before boosts/premium features, manual review for high spend.                                       |
| **Legal/Political Targeting of LGBTQ Members** | Medium     | Physical harm                       | Optional stealth mode removing branding from notifications, encrypted push payloads, jurisdiction-aware comms policies.                    |

### Next Steps

1. Socialize this document with legal and product stakeholders for sign-off.
2. Feed requirements into Phase 1/2 service specs (identity, policy engine, moderation).
3. Implement consent + residency tagging in IaC backlog.
