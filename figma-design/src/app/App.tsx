import { Navbar } from '@/app/components/Navbar';
import { Hero } from '@/app/components/Hero';
import { Features } from '@/app/components/Features';
import { HowItWorks } from '@/app/components/HowItWorks';
import { ProfileCards } from '@/app/components/ProfileCards';
import { SuccessStories } from '@/app/components/SuccessStories';
import { Pricing } from '@/app/components/Pricing';
import { CTA } from '@/app/components/CTA';
import { Footer } from '@/app/components/Footer';
import { Onboarding } from '@/app/components/Onboarding';
import { useState } from 'react';

export default function App() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="size-full overflow-x-hidden">
      <Navbar />
      <main>
        <Hero onGetStarted={() => setIsOnboardingOpen(true)} />
        <Features />
        <HowItWorks />
        <ProfileCards />
        <SuccessStories />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <Onboarding isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}
