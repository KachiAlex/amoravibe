import Link from 'next/link';
import { Badge, Card, PillButton } from '@lovedate/ui';
import type { TrustPreviewResponse } from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import PrivacyActionsPanel from './privacy-actions-panel';

export const dynamic = 'force-dynamic';

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
const stageThemes = [
  'from-[#fef2f2] via-[#fff5f7] to-white',
  'from-[#eef2ff] via-white to-[#f5f7ff]',
  'from-[#ecfeff] via-white to-[#f0fdfa]',
  'from-[#fff7ed] via-white to-[#fef9c3]',
];

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

  const journeyStages = preview.journey.map((step, index) => ({
    order: String(index + 1).padStart(2, '0'),
    theme: stageThemes[index % stageThemes.length],
    anchor: `stage-${step.id}`,
    ...step,
  }));

  const auditChecklist = [
    'Data export requests log to the audit service with requester metadata.',
    'Deletion flows enforce 7-day cooling-off period with escalation hooks.',
    'Every trust center access is recorded via ANALYTICS_DASHBOARD_ACCESSED actions.',
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0c1a] via-[#0f172a] to-[#101828] pb-24 pt-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 sm:px-10 lg:px-16">
        <section className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr]">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#111f3a] via-[#141a2f] to-[#0f172a] p-10 text-white shadow-[0_30px_80px_rgba(6,7,12,0.65)]">
            <div className="absolute -right-10 -top-12 h-72 w-72 rounded-full bg-[#7c3aed]/20 blur-3xl" />
            <div className="space-y-6">
              <Badge
                tone="primary"
                className="bg-white/10 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                {preview.snapshotLabel}
              </Badge>
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Trust view</p>
                <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                  Transparency lens before you enter the orbit
                </h1>
                <p className="max-w-2xl text-base text-white/80">
                  Live analytics fuel this preview so members understand verification, device trust,
                  and privacy tooling before landing on the full discovery dashboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard?section=home#top">
                  <PillButton className="bg-white text-[#0f172a] hover:bg-white/90">
                    Continue to dashboard
                  </PillButton>
                </Link>
                <Link href="#stages">
                  <PillButton variant="outline" className="border-white/30 text-white">
                    Preview each stage
                  </PillButton>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="border-none bg-white/95 p-8 text-ink-900 shadow-[0_25px_70px_rgba(11,17,34,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ink-500">
              Live snapshot
            </p>
            <dl className="mt-6 grid gap-6">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-[0.25em] text-ink-500">{stat.label}</dt>
                  <dd className="text-4xl font-semibold text-ink-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 rounded-2xl bg-ink-50/90 p-4 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">What powers this?</p>
              <p>
                Analytics snapshots (PII tiered), trust signal facts, and moderation reports all
                export into this overview within minutes.
              </p>
            </div>
          </Card>
        </section>

        <section id="stages" className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">Journey</p>
              <h2 className="mt-2 text-3xl font-semibold">Four trust stages before discovery</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-white/80">
              <span className="rounded-full border border-white/20 px-4 py-2">PII tiering</span>
              <span className="rounded-full border border-white/20 px-4 py-2">Device trust</span>
              <span className="rounded-full border border-white/20 px-4 py-2">Explainability</span>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {journeyStages.map((stage, index) => {
              const nextStage = journeyStages[index + 1]?.anchor;
              const nextHref = nextStage ? `#${nextStage}` : '/dashboard?section=home#top';
              return (
                <div
                  key={stage.title}
                  id={stage.anchor}
                  className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${stage.theme} p-6 text-[#0f172a] shadow-[0_25px_60px_rgba(8,9,14,0.4)]`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7c3aed]">
                      {stage.order}
                    </p>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#0f172a]">
                      {stage.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">{stage.title}</h3>
                  <p className="mt-2 text-sm text-[#475569]">{stage.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={nextHref}>
                      <PillButton className="bg-[#0f172a] text-white hover:bg-[#0b1020]">
                        {nextStage ? 'Next stage' : 'Enter dashboard'}
                      </PillButton>
                    </Link>
                    <Link href="/dashboard?section=discover#discover">
                      <PillButton variant="outline" className="border-[#0f172a] text-[#0f172a]">
                        See how it shows up in discover
                      </PillButton>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.4fr,0.9fr]">
          <Card className="space-y-8 border-none bg-white/95 p-8 text-ink-900 shadow-[0_25px_70px_rgba(11,17,34,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ink-500">
                  Highlights
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-ink-900">
                  What members can inspect
                </h2>
              </div>
              <Badge tone="primary">Live data</Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {preview.highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-3xl border border-ink-100 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                    {highlight.badge}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-ink-900">{highlight.title}</h3>
                  <p className="mt-2 text-sm text-ink-700">{highlight.body}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none bg-gradient-to-br from-white/95 to-white/80 p-8 text-ink-900 shadow-[0_25px_70px_rgba(11,17,34,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ink-500">
              Audit + privacy
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ink-900">Member-facing controls</h2>
            <ul className="mt-6 space-y-4 text-sm text-ink-700">
              {auditChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#7c3aed]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-4">
              <PrivacyActionsPanel userId={demoUserId} />
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
