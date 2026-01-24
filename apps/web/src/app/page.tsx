import { Badge, Card, PillButton } from '@lovedate/ui';
import type { TrustPreviewResponse } from '@lovedate/api';
import { lovedateApi } from '@/lib/api';

const fallbackPhases = [
  {
    label: '01',
    title: 'Orientation',
    description: 'Preference mapping, discovery space selection, and risk disclosures.',
    tag: 'Profile',
  },
  {
    label: '02',
    title: 'Verification',
    description: 'Government ID upload, selfie match, and biometric opt-in.',
    tag: 'Required',
  },
  {
    label: '03',
    title: 'Device Trust',
    description: 'Register trusted devices, configure biometrics, and review auth history.',
    tag: 'Security',
  },
  {
    label: '04',
    title: 'Trust Center',
    description: 'View moderation decisions, request exports, and monitor risk health.',
    tag: 'Transparency',
  },
];

const fallbackHighlights = [
  {
    title: 'Realtime Verification',
    body: 'Streamlined wizard backed by Persona/identity service with webhooks that unlock messaging in under 2 minutes.',
    badge: 'Phase 5 target',
  },
  {
    title: 'Transparent Risk Signals',
    body: 'Surface the signals powering Phase 4 dashboards so members understand why actions were taken.',
    badge: 'Trust Center',
  },
  {
    title: 'Privacy Controls',
    body: 'Initiate export/delete requests with explicit audit trails connected to the audit service APIs.',
    badge: 'Compliance',
  },
];

const fallbackStats = [
  { label: 'Verification pass', value: '92%' },
  { label: 'Risk score health', value: 'Stable' },
  { label: 'Export SLAs', value: '< 48h' },
];

async function getTrustPreview(): Promise<TrustPreviewResponse | null> {
  try {
    return await lovedateApi.fetchTrustPreview();
  } catch (error) {
    console.error('Failed to load trust preview', error);
    return null;
  }
}

export default async function Home() {
  const preview = await getTrustPreview();

  const snapshotLabel = preview?.snapshotLabel ?? 'Lovedate · Phase 5';
  const heroStats = preview
    ? [
        { label: 'Verification pass', value: `${preview.stats.verificationPassRate}%` },
        { label: 'Risk score health', value: preview.stats.riskHealth },
        { label: 'Export SLAs', value: `< ${preview.stats.exportSlaHours}h` },
      ]
    : fallbackStats;

  const journeyPhases = preview
    ? preview.journey.map((step, index) => ({
        label: String(index + 1).padStart(2, '0'),
        title: step.title,
        description: step.description,
        tag: step.tag,
      }))
    : fallbackPhases;

  return (
    <main className="px-6 pb-24 pt-14 sm:px-12 lg:px-20">
      <Card variant="highlight" className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-6">
            <Badge tone="primary" className="gap-3">
              {snapshotLabel}
            </Badge>
            <h1 className="font-display text-4xl leading-tight text-ink-900 sm:text-5xl">
              Client applications that make trust tangible
            </h1>
            <p className="max-w-2xl text-lg text-ink-700">
              The Lovedate Trust Center brings onboarding, verification, and privacy controls into a
              single experience. Built on the analytics pipelines from Phase 4, this surface gives
              members clarity and control over their safety signals.
            </p>
            <div className="flex flex-wrap gap-4">
              <PillButton>Launch onboarding flow</PillButton>
              <PillButton variant="outline">Review trust specs</PillButton>
            </div>
          </div>
          <Card className="w-full max-w-sm border-rose-500/20 bg-rose-500/5 text-sm text-ink-700">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-rose-500">Snapshot</span>
              <span className="font-mono text-xs text-ink-700">{snapshotLabel}</span>
            </div>
            <dl className="mt-6 space-y-4">
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

      <section className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-[2fr,1fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Journey</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">Four-step onboarding runway</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {journeyPhases.map((phase) => (
              <div
                key={phase.title}
                className="rounded-2xl border border-ink-900/10 bg-sand-100/60 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-rose-500">{phase.label}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-700/70">{phase.tag}</p>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-ink-900">{phase.title}</h3>
                <p className="mt-2 text-sm text-ink-700">{phase.description}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Next checkpoint</p>
          <h3 className="mt-4 text-2xl font-semibold text-ink-900">Web trust center alpha</h3>
          <ul className="mt-6 space-y-4 text-sm text-ink-700">
            <li>• Scaffold Next.js app with shared config (done)</li>
            <li>• Integrate identity service SDK + SSR auth</li>
            <li>• Build onboarding wizard w/ device capture</li>
            <li>• Wire trust center cards to Phase 4 APIs</li>
          </ul>
        </Card>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {(preview?.highlights ?? fallbackHighlights).map((highlight) => (
            <Card
              key={highlight.title}
              className="rounded-3xl border border-ink-900/10 bg-white/70 p-6 shadow-[0_12px_40px_rgba(13,15,26,0.08)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
                {highlight.badge}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-ink-900">{highlight.title}</h3>
              <p className="mt-2 text-sm text-ink-700">{highlight.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
