'use client';

import { ShieldCheck, Fingerprint, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useOnboardingModal } from '@/app/providers/OnboardingModalProvider';

const onboardingPhases = [
  {
    title: 'Identity ritual',
    duration: '~02 mins',
    description: 'Government ID and liveness selfies verified with concierge assistance.',
    icon: ShieldCheck,
  },
  {
    title: 'Values inventory',
    duration: '~03 mins',
    description: 'Pronouns, intentions, and boundaries captured with compassionate prompts.',
    icon: Sparkles,
  },
  {
    title: 'Device aura',
    duration: '~02 mins',
    description: 'Trusted devices and behavioral fingerprints registered to block impersonation.',
    icon: Smartphone,
  },
  {
    title: 'Trust review',
    duration: '~01 min',
    description: 'Preview your Trust Center report before you meet anyone new.',
    icon: Fingerprint,
  },
];

const trustHighlights = [
  'Zero-stress identity checks handled with concierge support.',
  'Values, boundaries, and intentions captured with cinematic care.',
  'Trust Center access to pause, purge, or reverify whenever you need.',
];

export function Onboarding() {
  const { openModal } = useOnboardingModal();

  return (
    <section id="onboarding" className="aurora-section py-24 text-white">
      <div className="relative mx-auto max-w-6xl space-y-12 px-6 sm:px-12">
        <div className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4 lg:max-w-3xl">
              <span className="section-badge text-white/90">Guided onboarding</span>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl text-white">
                Safety-first matchmaking ritual
              </h2>
              <p className="text-lg text-white/80">
                AmoraVibe blends biometric proof, behavior modeling, and human concierges so every
                member arrives calm, honest, and inspired. Complete onboarding once, then revisit your
                Trust Center anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="iridescent-button w-full lg:w-auto"
            >
              Start onboarding
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trustHighlights.map((highlight) => (
              <div
                key={highlight}
                className="glass-panel glass-panel--accent p-5 text-sm text-white/80"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white shadow-md shadow-pink-300/40">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  </div>
                  <p>{highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-midnight-900/60 to-transparent pointer-events-none lg:block" />
          <div className="flex gap-4 overflow-x-auto pb-4 pt-6 lg:justify-between">
            {onboardingPhases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.title}
                  className="glass-panel relative min-w-[260px] flex-1 bg-white/5 px-6 py-6 text-white lg:min-w-0 lg:max-w-[260px]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg shadow-pink-200/40">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <div className="text-sm uppercase tracking-[0.3em] text-white/70">
                      Phase 0{index + 1}
                    </div>
                    <span className="ml-auto whitespace-nowrap text-sm text-white/70">{phase.duration}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{phase.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{phase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
