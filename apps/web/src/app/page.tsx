import Image from 'next/image';
import { Badge, Card, PillButton } from '@lovedate/ui';
import type { TrustPreviewResponse } from '@lovedate/api';
import { lovedateApi } from '@/lib/api';

const fallbackHeroStats = [
  { label: 'Verified members', value: '92%' },
  { label: 'Match confidence', value: '98' },
  { label: 'Safety actions', value: '< 2h' },
];

const fallbackJourney = [
  {
    title: 'Foundations',
    description: 'Craft orientation, pronouns, and deal-breakers with a guided interview.',
  },
  {
    title: 'Proof of self',
    description: 'Government ID, liveness selfie, and biometric fallback—all in one flow.',
  },
  {
    title: 'Device aura',
    description:
      'Register trusted devices and create a behavioral fingerprint that keeps creeps out.',
  },
  {
    title: 'Trust center',
    description: 'See every signal, every moderation decision, and appeal transparently.',
  },
];

const promiseHighlights = [
  {
    title: 'No anonymous love bombing',
    body: 'Every match is verified with multi-signal biometrics, so chemistry starts from a place of truth.',
    badge: 'Security',
  },
  {
    title: 'Stories over swipes',
    body: 'Deep member journeys capture intent, values, and boundaries—so the first chat feels personal.',
    badge: 'Discovery',
  },
  {
    title: 'Safety is visible',
    body: 'Members can inspect their risk ledger, open tickets, and export data without waiting on support.',
    badge: 'Transparency',
  },
];

const studioMetrics = [
  'Biometric + document verification powered by Persona',
  'Real-time moderation feedback from Phase 4 trust models',
  '1:1 trust concierge for VIP members',
  'SOC 2 & GDPR aligned audit trail exports',
];

const inclusiveCouples = [
  {
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    alt: 'Black woman laughing with her partner during golden hour',
    vibe: 'Playful evening energy',
  },
  {
    src: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80',
    alt: 'Interracial couple hugging by the ocean',
    vibe: 'Slow sunrise vows',
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Couple cruising through the city on a vintage scooter',
    vibe: 'City escape interludes',
  },
  {
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Couple with natural curls smiling outdoors',
    vibe: 'Sunlit park promises',
  },
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
  const heroStats = preview
    ? [
        { label: 'Verified members', value: `${preview.stats.verificationPassRate}%` },
        { label: 'Risk score health', value: preview.stats.riskHealth },
        { label: 'Export SLAs', value: `< ${preview.stats.exportSlaHours}h` },
      ]
    : fallbackHeroStats;
  const journey = preview
    ? preview.journey.map((step) => ({ title: step.title, description: step.description }))
    : fallbackJourney;

  return (
    <main className="relative overflow-hidden px-6 pb-28 pt-16 sm:px-12 lg:px-24">
      <div className="absolute left-1/2 top-[-200px] h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-300/40 via-rose-500/20 to-sea-400/30 blur-[120px]" />
      <section className="relative mx-auto max-w-6xl rounded-[40px] border border-white/30 bg-white/80 p-8 shadow-[0_40px_120px_rgba(13,15,26,0.12)] backdrop-blur">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge tone="primary" className="w-fit bg-rose-500/10 text-rose-600">
                Lovedate · Trust Edition
              </Badge>
              <p className="font-mono text-xs uppercase tracking-[0.45em] text-ink-700/70">
                Premium dating for people who keep their promises
              </p>
              <h1 className="font-display text-4xl leading-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Romance built on truth, safety, and cinematic storytelling
              </h1>
              <p className="max-w-3xl text-lg text-ink-700">
                Lovedate pairs deep onboarding rituals with a transparent trust center so every
                match starts with consented data, verified identity, and a shared sense of calm.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <PillButton className="bg-rose-500 text-white hover:bg-rose-600">
                Enter onboarding
              </PillButton>
              <PillButton variant="outline" className="border-rose-200 text-ink-900">
                Explore Trust Center
              </PillButton>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <Card key={stat.label} className="bg-white/80 p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-ink-700/60">
                    {stat.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-ink-900">{stat.value}</p>
                </Card>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {inclusiveCouples.slice(0, 2).map((photo, index) => (
              <div
                key={photo.src}
                className="group relative h-64 overflow-hidden rounded-[32px] border border-white/30 bg-ink-900/80 shadow-[0_30px_60px_rgba(13,15,26,0.2)]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">Love Story</p>
                  <p className="mt-1 text-lg font-semibold">{photo.vibe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-10 lg:flex-row">
        <Card className="flex-1 bg-ink-900 text-white">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Our promise</p>
            <h2 className="font-display text-3xl">The trust ritual</h2>
            <p className="text-white/80">
              Before a single conversation unlocks, members move through a cinematic sequence of
              onboarding, biometric proof, and consented storytelling. Every action powers the Trust
              Center so matches stay gentle yet safe.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {promiseHighlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-2xl border border-white/20 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-rose-300">
                    {highlight.badge}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{highlight.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{highlight.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="flex-1 bg-white/80">
          <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">Journey map</p>
          <h2 className="mt-3 font-display text-3xl text-ink-900">
            Four scenes before the first date
          </h2>
          <div className="mt-8 space-y-5">
            {journey.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-ink-900/10 bg-gradient-to-r from-white via-white to-sand-100/70 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-rose-500">0{index + 1}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Phase</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-700">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto mt-20 max-w-6xl rounded-[32px] border border-ink-900/10 bg-white/70 p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-700/60">Lovedate studio</p>
            <h2 className="mt-3 font-display text-3xl text-ink-900">
              Why founders trust our rails
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {studioMetrics.map((metric) => (
                <div key={metric} className="rounded-2xl border border-ink-900/10 bg-white p-4">
                  <p className="text-sm text-ink-700">{metric}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="bg-gradient-to-br from-rose-500/80 via-rose-400/60 to-sea-400/70 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/80">Live signal</p>
            <h3 className="mt-4 text-2xl font-semibold">Trust Center status</h3>
            <dl className="mt-6 space-y-4 text-white/90">
              {heroStats.map((stat) => (
                <div key={`status-${stat.label}`}>
                  <dt className="text-xs uppercase tracking-[0.35em] text-white/70">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl">
        <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">Love stories</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-4xl text-ink-900">
            Portraits from the Lovedate universe
          </h2>
          <p className="text-base text-ink-700 lg:max-w-sm">
            We intentionally showcase Black, brown, queer, and interracial couples so every visitor
            sees themselves reflected before the onboarding ritual even begins.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {inclusiveCouples.map((photo) => (
            <Card key={photo.src} className="overflow-hidden border-0 bg-transparent p-0">
              <div className="relative h-72 w-full overflow-hidden rounded-[32px]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/70">Vibe</p>
                    <p className="text-lg font-semibold">{photo.vibe}</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
                    Lovedate muse
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-5xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.45em] text-ink-700/70">
          Final invitation
        </p>
        <h2 className="mt-4 font-display text-4xl text-ink-900">
          Crafted for people who value emotional safety as much as spark
        </h2>
        <p className="mt-4 text-lg text-ink-700">
          Book a trust concierge session and we will walk you through the onboarding ritual,
          moderation guarantees, and how your future members stay protected.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <PillButton className="bg-ink-900 text-white hover:bg-ink-700">
            Book a live walkthrough
          </PillButton>
          <PillButton variant="outline" className="border-ink-900/30 text-ink-900">
            Download the trust brief
          </PillButton>
        </div>
      </section>
    </main>
  );
}
