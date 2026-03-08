'use client';

import Link from 'next/link';
import { PillButton } from '@lovedate/ui';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';
export function CTA() {
  return (
    <section className="aurora-section px-6 py-24 text-white sm:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center">
        <span className="section-badge mx-auto text-white/80">✨ Start Your Journey Today</span>
        <h2 className="font-display text-4xl sm:text-5xl leading-tight gradient-heading">
          Ready to Find Your Perfect Match?
        </h2>
        <p className="text-lg text-white/75">
          Join over 2 million singles who&apos;ve found love on AmoraVibe. Your story could be next!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <PillButton asChild className="iridescent-button font-semibold">
            <OpenOnboardingButton className="inline-flex items-center gap-2">
              Get Started Free
            </OpenOnboardingButton>
          </PillButton>
          <PillButton
            variant="outline"
            asChild
            className="frosted-pill border-white/40 text-white/90"
          >
            <Link href="#how-it-works">Learn More</Link>
          </PillButton>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span aria-hidden>✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden>✓</span>
            <span>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden>✓</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
