'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, PillButton } from '@lovedate/ui';

export default function TrustCenterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Trust center failed to load', error);
  }, [error]);

  return (
    <main className="px-6 pb-24 pt-20 sm:px-12 lg:px-20">
      <Card variant="highlight" className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl text-ink-900">
          We couldn&apos;t load your trust snapshot
        </h1>
        <p className="mt-4 text-sm text-ink-700">
          Something interrupted the call to the Lovedate identity service. The attempt was logged
          for audit review. Retry below or head back to the overview page while we recover.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <PillButton onClick={reset}>Retry</PillButton>
          <PillButton variant="outline" onClick={() => router.push('/')}>
            Return to overview
          </PillButton>
        </div>
      </Card>
    </main>
  );
}
