import { Badge, Card, PillButton } from '@lovedate/ui';
import Link from 'next/link';
import type { TrustCenterSnapshotResponse } from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import { getSession } from '@/lib/session';
import ReverifyPanel from './reverify-panel';

interface DashboardPageProps {
  searchParams?: Promise<{ userId?: string }> | { userId?: string };
}

async function loadSnapshot(userId: string): Promise<TrustCenterSnapshotResponse | null> {
  try {
    return await lovedateApi.fetchTrustSnapshot(userId);
  } catch (error) {
    console.error('Failed to load trust snapshot', error);
    return null;
  }
}

export default async function DashboardPage(props: DashboardPageProps) {
  const resolvedParams = await Promise.resolve(props.searchParams ?? {});
  const session = getSession();
  const userId = resolvedParams?.userId ?? session?.userId ?? null;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <h1 className="font-display text-3xl text-ink-900">Trust dashboard</h1>
          <p className="text-ink-700">
            You’re not signed in yet. Complete onboarding or re-open the matches page to generate a
            session.
          </p>
          <p className="text-sm text-ink-600">
            Once onboarding completes we store a secure cookie so you can return here without
            passing query params.
          </p>
          <PillButton asChild>
            <Link href="/onboarding">Return to onboarding</Link>
          </PillButton>
        </Card>
      </main>
    );
  }

  const snapshot = await loadSnapshot(userId);

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <h1 className="font-display text-3xl text-ink-900">Trust dashboard</h1>
          <p className="text-ink-700">
            We couldn’t load the trust center snapshot for this user yet.
          </p>
          <p className="text-sm text-ink-600">
            Give our identity service a few seconds, then refresh or re-run onboarding.
          </p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Retry onboarding</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/trust-center">View trust preview</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  const verifiedTone = snapshot.user.isVerified ? 'text-emerald-600' : 'text-rose-500';
  const verifiedLabel = snapshot.user.isVerified ? 'Verified' : 'Pending verification';

  return (
    <main className="space-y-12 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[36px] border border-white/40 bg-white/85 p-8 shadow-[0_30px_100px_rgba(13,15,26,0.12)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <Badge tone="primary" className="mb-4 bg-rose-500/10 text-rose-500">
              Trust dashboard
            </Badge>
            <h1 className="font-display text-4xl text-ink-900">Hi, {snapshot.user.displayName}</h1>
            <p className="mt-2 text-lg text-ink-700">
              Here’s a live readout of your verification, device trust, and moderation history. Keep
              your signals green to stay in the Lovedate orbit.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className={`rounded-full bg-white/80 px-4 py-2 font-semibold ${verifiedTone}`}>
                {verifiedLabel}
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 text-ink-700">
                Member since {new Date(snapshot.user.createdAt).toLocaleDateString()}
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 text-ink-700">
                Trust score {snapshot.user.trustScore ?? '—'}
              </span>
            </div>
          </div>
          <Card className="w-full max-w-sm bg-ink-900 text-white">
            <ReverifyPanel
              userId={snapshot.user.id}
              verificationStatus={snapshot.verification?.status ?? null}
              providerLabel={snapshot.verification?.provider ?? 'Pending assignment'}
              updatedAt={snapshot.verification?.updatedAt ?? null}
            />
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <Card className="space-y-4">
          <header>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">Risk profile</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink-900">Signals we monitor</h3>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            {snapshot.riskProfile ? (
              <>
                <StatTile label="Trust score" value={snapshot.riskProfile.trustScore.toString()} />
                <StatTile
                  label="Last evaluated"
                  value={
                    snapshot.riskProfile.lastEvaluatedAt
                      ? new Date(snapshot.riskProfile.lastEvaluatedAt).toLocaleString()
                      : '—'
                  }
                />
              </>
            ) : (
              <p className="text-ink-700">We haven’t computed your trust score yet.</p>
            )}
          </div>
          {snapshot.riskSignals.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Recent signals</p>
              <div className="space-y-3">
                {snapshot.riskSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="rounded-2xl border border-ink-900/10 bg-sand-100/60 p-4"
                  >
                    <p className="text-sm font-semibold text-ink-900">{signal.type}</p>
                    <p className="text-xs text-ink-700">
                      {signal.channel} • {signal.severity}{' '}
                      {signal.score !== null ? `• score ${signal.score}` : ''}
                    </p>
                    <p className="text-xs text-ink-600">
                      {new Date(signal.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <header>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">Devices</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink-900">Trusted fingerprints</h3>
          </header>
          {snapshot.devices.length ? (
            <div className="space-y-3">
              {snapshot.devices.map((device) => (
                <div key={device.id} className="rounded-2xl border border-ink-900/10 bg-white p-4">
                  <p className="text-sm font-semibold text-ink-900">{device.hash}</p>
                  <p className="text-xs text-ink-700">{device.userAgent ?? 'Unknown agent'}</p>
                  <p className="text-xs text-ink-600">
                    Seen {new Date(device.observedAt).toLocaleString()} •{' '}
                    {device.riskLabel ?? 'clean'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-700">No trusted devices yet—complete device trust to add one.</p>
          )}
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.3fr,0.7fr]">
        <Card className="space-y-4">
          <header>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">Moderation events</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink-900">Your safety log</h3>
          </header>
          {snapshot.moderationEvents.length ? (
            <ul className="space-y-3">
              {snapshot.moderationEvents.map((event) => (
                <li key={event.id} className="rounded-2xl border border-ink-900/10 bg-white p-4">
                  <p className="text-sm font-semibold text-ink-900">{event.severity}</p>
                  <p className="text-sm text-ink-700">{event.message}</p>
                  <p className="text-xs text-ink-600">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-700">
              No moderation events on your record. Keep it considerate.
            </p>
          )}
        </Card>

        <Card className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">Audit summary</p>
          <h3 className="text-2xl font-semibold text-ink-900">Privacy requests</h3>
          <p className="text-5xl font-semibold text-ink-900">{snapshot.auditSummary.totalEvents}</p>
          <p className="text-sm text-ink-700">
            Last event{' '}
            {snapshot.auditSummary.lastEventAt
              ? new Date(snapshot.auditSummary.lastEventAt).toLocaleDateString()
              : '—'}
          </p>
          <PillButton asChild>
            <Link href="/trust-center">Read transparency commitments</Link>
          </PillButton>
        </Card>
      </section>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.35em] text-ink-700/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
