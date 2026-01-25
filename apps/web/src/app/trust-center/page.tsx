import Link from 'next/link';
import { Badge, Card, PillButton } from '@lovedate/ui';
import type { TrustPreviewResponse } from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import PrivacyActionsPanel from './privacy-actions-panel';

const fallbackPreview: TrustPreviewResponse = {
  snapshotLabel: 'Lovedate · Phase 5',
  stats: {
    verificationPassRate: 92,
    riskHealth: 'stable',
    exportSlaHours: 48,
  },
  journey: [
    {
      id: 'orientation',
      title: 'Orientation',
      description: 'Preference mapping, discovery space selection, and risk disclosures.',
      tag: 'Profile',
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Government ID upload, selfie match, and biometric opt-in.',
      tag: 'Required',
    },
    {
      id: 'device_trust',
      title: 'Device trust',
      description: 'Register trusted devices, configure biometrics, and review auth history.',
      tag: 'Security',
    },
    {
      id: 'trust_center',
      title: 'Trust center',
      description: 'View moderation decisions, request exports, and monitor risk health.',
      tag: 'Transparency',
    },
  ],
  highlights: [
    {
      title: 'Realtime verification',
      body: 'Persona-backed flow unlocks messaging within minutes with selfie fallback.',
      badge: 'Phase 5',
    },
    {
      title: 'Transparent risk signals',
      body: 'Members can inspect risk drivers pulled from Phase 4 analytics dashboards.',
      badge: 'Trust ML',
    },
    {
      title: 'Privacy tooling',
      body: 'Data export + delete requests wire into audit service SLAs (<48h).',
      badge: 'Compliance',
    },
  ],
};

const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? 'demo-user';

async function getTrustPreview(): Promise<TrustPreviewResponse | null> {
  try {
    return await lovedateApi.fetchTrustPreview();
  } catch (error) {
    console.error('Failed to load trust preview', error);
    return null;
  }
}

export default async function TrustCenterPage() {
  const preview = (await getTrustPreview()) ?? fallbackPreview;

  const heroStats = [
    { label: 'Verification pass', value: `${preview.stats.verificationPassRate}%` },
    { label: 'Risk health', value: preview.stats.riskHealth },
    { label: 'Export SLA', value: `< ${preview.stats.exportSlaHours}h` },
  ];

  const journeySteps = preview.journey.map((step, index) => ({
    order: String(index + 1).padStart(2, '0'),
    ...step,
  }));

  const auditChecklist = [
    'Data export requests log to the audit service with requester metadata.',
    'Deletion flows enforce 7-day cooling-off period with escalation hooks.',
    'Every trust center access is recorded via ANALYTICS_DASHBOARD_ACCESSED actions.',
  ];

  const signalChips = [
    { label: 'PII tiering', detail: 'Tier-1 PII hashed with salted SHA-256.' },
    { label: 'Device trust', detail: 'Passkeys + biometric fallback enforced.' },
    { label: 'Model explainability', detail: 'Phase 4 risk signals surfaced verbatim.' },
  ];

  return (
    <main className="space-y-16 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <Card variant="highlight" className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="space-y-6">
            <Badge tone="primary" className="gap-3 text-sm">
              {preview.snapshotLabel}
            </Badge>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-ink-900 sm:text-5xl">
                Trust center transparency preview
              </h1>
              <p className="max-w-2xl text-lg text-ink-700">
                Built on Phase 4 analytics + audit guarantees, this surface lets members verify
                identity status, inspect risk signals, and initiate privacy workflows in a single
                motion.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/">
                <PillButton>Return to overview</PillButton>
              </Link>
              <Link href="#journey">
                <PillButton variant="outline">Review onboarding runway</PillButton>
              </Link>
            </div>
          </div>
          <Card className="w-full max-w-md border-rose-500/30 bg-white/90">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Snapshot</p>
            <dl className="mt-6 space-y-5">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-[0.3em] text-ink-700/70">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-semibold text-ink-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </Card>

      <section id="journey" className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Journey</p>
            <h2 className="mt-2 font-display text-3xl text-ink-900">Four-step onboarding runway</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {signalChips.map((chip) => (
              <span
                key={chip.label}
                className="rounded-full border border-ink-900/10 bg-sand-100/70 px-4 py-2 text-xs font-semibold text-ink-800"
              >
                <span className="uppercase tracking-[0.2em] text-rose-500">{chip.label}</span>
                <span className="ml-2 text-ink-700">{chip.detail}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {journeySteps.map((phase) => (
            <Card key={phase.title} className="border-ink-900/10 bg-white/80">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-rose-500">{phase.order}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-700/70">{phase.tag}</p>
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-ink-900">{phase.title}</h3>
              <p className="mt-2 text-sm text-ink-700">{phase.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl">
        <Card className="space-y-8 border-ink-900/10 bg-white/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Highlights</p>
              <h2 className="mt-2 font-display text-3xl text-ink-900">
                What the trust center exposes
              </h2>
            </div>
            <Badge tone="primary">Live data</Badge>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {preview.highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-3xl border border-ink-900/10 bg-white/70 p-6 shadow-[0_12px_40px_rgba(13,15,26,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
                  {highlight.badge}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-ink-900">{highlight.title}</h3>
                <p className="mt-2 text-sm text-ink-700">{highlight.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl">
        <Card className="grid gap-10 border-ink-900/10 bg-white/80 lg:grid-cols-[1.5fr,1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Audit + privacy</p>
            <h2 className="mt-2 font-display text-3xl text-ink-900">Member-facing controls</h2>
            <ul className="mt-6 space-y-4 text-sm text-ink-700">
              {auditChecklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <PrivacyActionsPanel userId={demoUserId} />
        </Card>
      </section>
    </main>
  );
}
