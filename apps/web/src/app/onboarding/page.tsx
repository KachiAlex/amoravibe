import type { Metadata } from 'next';
import type { OnboardingStatusResponse } from '@lovedate/api';
import { Badge, Card } from '@lovedate/ui';
import { lovedateApi } from '@/lib/api';
import OnboardingWizard from './onboarding-wizard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Lovedate · Onboarding wizard',
  description:
    'Guide members through identity verification, discovery setup, and trust onboarding with a single multi-step flow.',
};

const fallbackStatus = (userId: string): OnboardingStatusResponse => ({
  userId,
  progressPercent: 33,
  steps: [
    {
      id: 'identity',
      title: 'Identity proof',
      description: 'Scan government ID + liveness selfie',
      status: 'active',
    },
    {
      id: 'device',
      title: 'Device trust',
      description: 'Register trusted device + biometric fallback',
      status: 'pending',
    },
    {
      id: 'profile',
      title: 'Discovery profile',
      description: 'Orientation, pronouns, and match intent',
      status: 'pending',
    },
  ],
});

async function fetchStatus(userId: string): Promise<OnboardingStatusResponse | null> {
  try {
    return await lovedateApi.fetchOnboardingStatus(userId);
  } catch (error) {
    console.error('Failed to load onboarding status', error);
    return null;
  }
}

export default async function OnboardingPage() {
  const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? 'demo-user';
  const status = (await fetchStatus(demoUserId)) ?? fallbackStatus(demoUserId);

  return (
    <main className="px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <Badge tone="primary" className="uppercase tracking-[0.3em]">
          Lovedate Trust · Onboarding
        </Badge>
        <h1 className="font-display text-4xl leading-tight text-ink-900 sm:text-5xl">
          Welcoming members into a safer dating network
        </h1>
        <p className="max-w-3xl text-lg text-ink-700">
          This multi-step wizard combines identity verification, device trust, and discovery setup
          into one guided journey. Each submission flows directly into the identity service,
          unlocking the Trust Center experience once verifications pass.
        </p>
        <Card className="w-full max-w-4xl border-rose-500/20 bg-rose-500/5 text-left">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Current progress</p>
              <p className="mt-2 text-3xl font-semibold text-ink-900">{status.progressPercent}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Next requirement</p>
              <p className="mt-2 text-lg text-ink-900">
                {status.steps.find((step) => step.status === 'active')?.title ?? 'Identity proof'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Demo user</p>
              <p className="mt-2 font-mono text-sm text-ink-900">{demoUserId}</p>
            </div>
          </div>
        </Card>
      </div>

      <section className="mx-auto mt-12 max-w-6xl">
        <OnboardingWizard status={status} demoUserId={demoUserId} />
      </section>
    </main>
  );
}
