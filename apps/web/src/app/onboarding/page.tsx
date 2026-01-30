import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, Smartphone, Fingerprint } from 'lucide-react';
import { PillButton, Card, Badge } from '@lovedate/ui';
import { Onboarding } from '@/app/components/Onboarding';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';

const reassurancePoints = [
  'Persona-backed identity verification with concierge fallback.',
  'Device fingerprinting + passkey pairing before messaging unlocks.',
  'Privacy controls (export, delete, pause) wired into the Trust Center pipeline.',
];

const accelerators = [
  {
    icon: ShieldCheck,
    title: 'Identity proof',
    body: 'Government ID + selfie match complete in under two minutes.',
  },
  {
    icon: Sparkles,
    title: 'Values inventory',
    body: 'Pronouns, orientation, boundaries, and intent captured once and synced to discovery.',
  },
  {
    icon: Smartphone,
    title: 'Device aura',
    body: 'Trusted devices + behavioral biometrics registered for live threat monitoring.',
  },
  {
    icon: Fingerprint,
    title: 'Trust review',
    body: 'Preview your Trust Center snapshot and privacy levers before you meet anyone new.',
  },
];

export const metadata = {
  title: 'Lovedate · Onboarding',
  description:
    'Complete the Lovedate trust ritual so you can access the dashboard, discovery, and messaging surfaces.',
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#050616] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-16">
        <header className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to welcome
          </Link>
          <div className="space-y-4">
            <Badge
              tone="primary"
              className="bg-white/10 text-xs uppercase tracking-[0.4em] text-white"
            >
              Lovedate onboarding ritual
            </Badge>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              Finish onboarding to unlock the Trust Center + discovery orbit
            </h1>
            <p className="max-w-3xl text-white/80">
              Complete six guided steps covering identity, preferences, devices, and privacy. Once
              finished, you&apos;ll jump straight into the dashboard with a live trust snapshot,
              discovery feed, and messaging inbox.
            </p>
            <div className="flex flex-wrap gap-4">
              <PillButton asChild>
                <OpenOnboardingButton className="bg-white text-[#050616] hover:bg-white/90">
                  Open onboarding flow
                </OpenOnboardingButton>
              </PillButton>
              <PillButton variant="outline" asChild>
                <Link href="/trust-center">Preview trust center</Link>
              </PillButton>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="space-y-6 border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-semibold">Why we route everyone through onboarding</h2>
            <p className="text-sm text-white/75">
              Lovedate is safety-first. We blend biometric proofing, behavioral analytics, and human
              review so your matches feel real and accountable. This page gathers every prerequisite
              in one place, then pushes you straight into your dashboard when done.
            </p>
            <ul className="space-y-4 text-sm text-white/85">
              {reassurancePoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-pink-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-white/20 bg-[#050616]/60 p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">Trust accelerators</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {accelerators.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/15 bg-white/5 p-4"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-semibold">{item.title}</p>
                    <p className="text-sm text-white/75">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Need help?</p>
            <h3 className="mt-2 text-2xl font-semibold">Concierge support is a tap away</h3>
            <p className="mt-3 text-sm text-white/75">
              If you hit any friction, our trust stewards can verify documents over live chat, help
              with device enrollment, or walk you through privacy settings.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/85">
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold">Live chat</p>
                <p className="text-white/70">Weekdays 9am–9pm · Verified team</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold">Secure upload</p>
                <p className="text-white/70">Persona-backed file vault for IDs & proofs</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold">Escalations</p>
                <p className="text-white/70">24h SLA for safety or privacy concerns</p>
              </div>
            </div>
            <div className="mt-6">
              <PillButton variant="outline" asChild>
                <Link href="/support">Ping the trust team →</Link>
              </PillButton>
            </div>
          </Card>
        </section>

        <Onboarding />
      </div>
    </main>
  );
}
