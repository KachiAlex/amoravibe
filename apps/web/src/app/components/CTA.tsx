'use client';

import Link from 'next/link';
import { PillButton } from '@lovedate/ui';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';
export function CTA() {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-20 text-white sm:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center">
        <p className="text-sm font-semibold">✨ Start Your Journey Today</p>
        <h2 className="font-display text-5xl leading-tight">
          Ready to Find Your <span className="underline">Perfect Match</span>?
        </h2>
        <p className="text-lg text-white/90">
          Join over 2 million singles who&apos;ve found love on AmoraVibe. Your story could be next!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <PillButton asChild className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
            <OpenOnboardingButton className="inline-block">Get Started Free</OpenOnboardingButton>
          </PillButton>
          <PillButton
            variant="outline"
            asChild
            className="border-white text-white hover:bg-white/10"
          >
            <Link href="#how-it-works">Learn More</Link>
          </PillButton>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
