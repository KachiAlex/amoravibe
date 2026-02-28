'use client';

import { ShieldCheck, Fingerprint, Smartphone, Sparkles } from 'lucide-react';
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

export function Onboarding() {
  const { openModal } = useOnboardingModal();

  return (
    <section
      id="onboarding"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(255,192,203,0.3),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(147,112,219,0.2),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f9f5ff_60%,#f5f5f5_100%)] py-24 text-ink-900"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-pink-200/35 blur-[160px]" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-purple-200/30 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 sm:px-12 lg:flex-row">
        <div className="space-y-6 lg:w-5/12">
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/80 px-4 py-1 text-sm uppercase tracking-[0.3em] text-fuchsia-700">
            Guided onboarding
          </span>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl text-ink-900">
            Safety-first matchmaking ritual
          </h2>
          <p className="text-ink-700">
            AmoraVibe blends biometric proof, behavior modeling, and human concierges so every
            member arrives calm, honest, and inspired. Complete onboarding once, then revisit your
            Trust Center anytime.
          </p>
          <div className="grid gap-3 text-sm text-white/80">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-400" />
              Zero-stress identity checks handled with concierge support.
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-400" />
              Values, boundaries, and intentions captured with cinematic care.
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-400" />
              Trust Center access to pause, purge, or reverify whenever you need.
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 font-medium text-white shadow-lg shadow-pink-300/30 transition hover:translate-y-0.5"
            >
              Start onboarding
            </button>
          </div>
        </div>

        <div className="relative flex-1">
          <div className="absolute left-6 top-4 bottom-4 hidden lg:block w-px bg-white/15" />
          <div className="flex flex-col gap-4">
            {onboardingPhases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.title}
                  className="relative rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-200/40">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-sm uppercase tracking-[0.3em] text-ink-600">
                      Phase 0{index + 1}
                    </div>
                    <span className="ml-auto text-sm text-ink-600">{phase.duration}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-ink-900">{phase.title}</h3>
                  <p className="mt-2 text-ink-700">{phase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
