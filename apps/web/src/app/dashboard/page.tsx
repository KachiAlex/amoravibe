import { Badge, Card, PillButton } from '@lovedate/ui';
import Link from 'next/link';
import { Activity, ShieldCheck, Smartphone } from 'lucide-react';
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

  const verifiedTone = snapshot.user.isVerified ? 'text-emerald-500' : 'text-rose-400';
  const verifiedLabel = snapshot.user.isVerified ? 'Verified' : 'Pending verification';
  const devicesTrusted = snapshot.devices.length;
  const outstandingSignals = snapshot.riskSignals.length;
  const moderationCount = snapshot.moderationEvents.length;
  const actionItems: ActionItemProps[] = [
    {
      title: snapshot.user.isVerified ? 'Identity verified' : 'Verify your identity',
      description: snapshot.user.isVerified
        ? 'Your documents are confirmed—no further action needed.'
        : 'Complete your identity review to unlock matches and safety tooling.',
      complete: snapshot.user.isVerified,
      icon: ShieldCheck,
      href: snapshot.user.isVerified ? undefined : '#verification-panel',
    },
    {
      title:
        devicesTrusted > 0
          ? `${devicesTrusted} trusted device${devicesTrusted > 1 ? 's' : ''}`
          : 'Add your first trusted device',
      description:
        devicesTrusted > 0
          ? 'We’ll keep watching for suspicious fingerprints.'
          : 'Pair a primary device so we can monitor unusual logins.',
      complete: devicesTrusted > 0,
      icon: Smartphone,
      href: '#devices-section',
    },
    {
      title: outstandingSignals === 0 ? 'Risk signals stable' : 'Review recent risk signals',
      description:
        outstandingSignals === 0
          ? 'All systems green—enjoy your matches.'
          : 'We spotted new activity that could impact trust. Take a look.',
      complete: outstandingSignals === 0,
      icon: Activity,
      href: outstandingSignals === 0 ? undefined : '#risk-section',
    },
  ];

  return (
    <main className="space-y-12 px-6 pb-24 pt-12 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/20 bg-[radial-gradient(circle_at_top,_#1e1b4b,_#111327_60%)] text-white shadow-[0_35px_120px_rgba(13,15,26,0.45)]">
        <div className="relative grid gap-10 p-10 lg:grid-cols-[1.7fr,1fr]">
          <div>
            <Badge tone="primary" className="mb-5 border border-white/30 bg-white/10 text-white">
              Trust dashboard
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl">
              Hi {snapshot.user.displayName}, welcome to your orbit
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Monitor verification, device trust, and moderation health in one command center. Keep
              these signals green to glide through onboarding review and matchmaking.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <MetricPill label="Status" value={verifiedLabel} className={verifiedTone} />
              <MetricPill
                label="Member since"
                value={new Date(snapshot.user.createdAt).toLocaleDateString()}
              />
              <MetricPill label="Trust score" value={snapshot.user.trustScore?.toString() ?? '—'} />
            </div>

            <ActionList items={actionItems} className="mt-10" />
          </div>

          <Card id="verification-panel" className="w-full border-white/30 bg-white/5 text-white">
            <ReverifyPanel
              userId={snapshot.user.id}
              verificationStatus={snapshot.verification?.status ?? null}
              providerLabel={snapshot.verification?.provider ?? 'Pending assignment'}
              updatedAt={snapshot.verification?.updatedAt ?? null}
            />
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        <InsightCard
          title="Verification"
          icon={ShieldCheck}
          accent="from-emerald-500/30 to-emerald-600/40"
          description={snapshot.user.isVerified ? 'Fully unlocked' : 'Review still required'}
        >
          <p className="text-3xl font-semibold">{verifiedLabel}</p>
          <p className="text-sm text-ink-600">Provider: {snapshot.verification?.provider ?? '—'}</p>
        </InsightCard>
        <InsightCard
          title="Devices"
          icon={Smartphone}
          accent="from-sky-500/30 to-indigo-500/40"
          description="Trusted fingerprints"
        >
          <p className="text-3xl font-semibold">{devicesTrusted}</p>
          <p className="text-sm text-ink-600">
            Last seen{' '}
            {devicesTrusted > 0
              ? new Date(snapshot.devices[0].observedAt).toLocaleDateString()
              : '—'}
          </p>
        </InsightCard>
        <InsightCard
          title="Safety"
          icon={Activity}
          accent="from-rose-500/30 to-orange-500/40"
          description="Moderation log"
        >
          <p className="text-3xl font-semibold">{moderationCount}</p>
          <p className="text-sm text-ink-600">
            {moderationCount === 0 ? 'Clean record' : 'Review the latest events below'}
          </p>
        </InsightCard>
      </section>

      <section id="risk-section" className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <Card className="space-y-5">
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
          {snapshot.riskSignals.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Recent signals</p>
              <div className="space-y-3">
                {snapshot.riskSignals.map((signal) => (
                  <TimelineEvent
                    key={signal.id}
                    title={signal.type}
                    subtitle={`${signal.channel} • ${signal.severity}${
                      signal.score !== null ? ` • score ${signal.score}` : ''
                    }`}
                    timestamp={signal.createdAt}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-ink-700">
              No risk signals at the moment. We’ll notify you if that changes.
            </p>
          )}
        </Card>

        <Card id="devices-section" className="space-y-4">
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
            <h3 className="mt-2 text-2xl font-semibold text-ink-900">Safety log</h3>
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

interface ActionItemProps {
  title: string;
  description: string;
  complete: boolean;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

function ActionList({ items, className = '' }: { items: ActionItemProps[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={`grid gap-4 lg:grid-cols-3 ${className}`}>
      {items.map((item) => (
        <ActionItem key={item.title} {...item} />
      ))}
    </div>
  );
}

function ActionItem({ title, description, complete, icon: Icon, href }: ActionItemProps) {
  const content = (
    <div className="group flex h-full flex-col rounded-2xl border border-white/20 bg-white/5 p-4 text-white/90 transition hover:border-white/60">
      <div
        className={`mb-3 inline-flex size-10 items-center justify-center rounded-full ${complete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400/20 text-amber-200'}`}
      >
        <Icon className="size-5" />
      </div>
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-white/70">{description}</p>
      <div className="mt-auto pt-4 text-xs uppercase tracking-[0.35em] text-white/60">
        {complete ? 'Complete' : 'Action needed'}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function MetricPill({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white/90 ${className}`}
    >
      <span className="mr-2 text-white/60">{label}</span>
      {value}
    </span>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  children: React.ReactNode;
}

function InsightCard({ title, description, icon: Icon, accent, children }: InsightCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border border-ink-900/5 bg-gradient-to-br ${accent}`}
    >
      <div className="relative z-10 space-y-1 p-6">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-ink-900/70">
          <Icon className="size-4" />
          {title}
        </div>
        <p className="text-sm text-ink-900/80">{description}</p>
        <div className="pt-4">{children}</div>
      </div>
      <div className="absolute inset-0 opacity-40" aria-hidden />
    </Card>
  );
}

function TimelineEvent({
  title,
  subtitle,
  timestamp,
}: {
  title: string;
  subtitle: string;
  timestamp: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-sand-100/70 p-4">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="text-xs text-ink-700">{subtitle}</p>
      <p className="text-xs text-ink-600">{new Date(timestamp).toLocaleString()}</p>
    </div>
  );
}
