import Container from '@/app/admin/Container';
import { requireAdminUser } from '@/lib/admin-auth';
import { getAdminMetrics } from '@/lib/admin-metrics';
import { Suspense } from 'react';

const severityColors: Record<string, string> = {
  high: 'bg-rose-500/20 text-rose-200',
  medium: 'bg-amber-500/20 text-amber-200',
  low: 'bg-emerald-500/20 text-emerald-200',
};

const signals = [
  {
    id: 'sig-1282',
    title: 'Burst of reports in Lagos',
    detail: '18 users flagged romance scam in last hour',
    severity: 'high',
  },
  {
    id: 'sig-1281',
    title: 'Onboarding funnel dip',
    detail: 'Step 3 drop-off up 11% on Android 15',
    severity: 'medium',
  },
  {
    id: 'sig-1279',
    title: 'Elite queue backlog',
    detail: '42 pending concierge verifications (SLA 15m)',
    severity: 'low',
  },
];

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

async function MetricCards() {
  const metrics = await getAdminMetrics();
  const cards = [
    { label: 'Total Members', value: metrics.totalMembers, change: '+3.8% WoW' },
    { label: 'Active (24h)', value: metrics.activeDay, change: '+1.9% vs avg' },
    { label: 'New Signups', value: metrics.newSignups, change: '+12.4% WoW' },
    { label: 'Flagged Accounts', value: metrics.flaggedAccounts, change: '-6.1% WoW' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{formatNumber(metric.value)}</p>
          <p className="mt-2 text-sm text-emerald-300">{metric.change}</p>
        </div>
      ))}
    </div>
  );
}

function RecentSignals() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trust Signals</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Live Alerts</h3>
        </div>
        <button className="text-sm font-medium text-emerald-300 hover:text-white">Open Console ?</button>
      </div>
      <div className="mt-6 space-y-4">
        {signals.map((signal) => (
          <div key={signal.id} className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-white">{signal.title}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityColors[signal.severity]}`}>
                {signal.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{signal.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const admin = await requireAdminUser();

  return (
    <Container>
      <div className="space-y-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">{admin.email}</h2>
              <p className="text-sm text-slate-400">Monitoring platform integrity + growth</p>
            </div>
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Download report
            </button>
          </div>
        </div>

        <Suspense fallback={<div className="h-32 rounded-2xl bg-white/5" />}>
          {/* @ts-expect-error Async Server Component */}
          <MetricCards />
        </Suspense>

        <div className="grid gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trajectory</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Engagement curve</h3>
              <div className="mt-6 h-64 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/30" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Concierge Queue</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Human interventions</h3>
                </div>
                <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                  View queue
                </button>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                <li className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <span>Identity approvals</span>
                  <span className="text-white">12 pending</span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <span>Trust escalations</span>
                  <span className="text-white">5 in review</span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <span>Match overrides</span>
                  <span className="text-white">2 awaiting supervisor</span>
                </li>
              </ul>
            </div>
          </div>

          <RecentSignals />
        </div>
      </div>
    </Container>
  );
}