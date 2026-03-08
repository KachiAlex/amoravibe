import { requireAdminUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const summaryCards = [
  { label: 'Queue load', value: '68 active', detail: '12 critical • 18 high' },
  { label: 'Avg SLA', value: '08m 41s', detail: 'Target 10m • 92% met' },
  { label: 'Escalations', value: '27 open', detail: '5 waiting on legal' },
  { label: 'Automation', value: '61% resolved', detail: '+8 pts vs yesterday' },
];

const severityStyles: Record<string, string> = {
  critical: 'bg-rose-500/20 text-rose-200',
  high: 'bg-amber-500/20 text-amber-200',
  medium: 'bg-cyan-500/20 text-cyan-200',
  low: 'bg-emerald-500/20 text-emerald-200',
};

const openReports = [
  {
    id: 'RPT-2042',
    user: 'Sarah A.',
    location: 'Lagos, NG',
    type: 'Romance scam ring',
    severity: 'critical',
    age: '12m',
    channel: 'in-app',
  },
  {
    id: 'RPT-2039',
    user: 'Ethan K.',
    location: 'Berlin, DE',
    type: 'Catfish / stolen media',
    severity: 'high',
    age: '23m',
    channel: 'trust@',
  },
  {
    id: 'RPT-2035',
    user: 'Noor U.',
    location: 'Dubai, AE',
    type: 'Hate speech spike',
    severity: 'medium',
    age: '41m',
    channel: 'guardian bot',
  },
];

const heatmap = [
  { region: 'West Africa', spike: '+42%', backlog: 11 },
  { region: 'DACH', spike: '+18%', backlog: 6 },
  { region: 'Gulf states', spike: '+9%', backlog: 4 },
  { region: 'US / Canada', spike: '+4%', backlog: 2 },
];

const analysts = [
  { name: 'Adaeze', shift: 'EMEA', active: true, load: '6 cases' },
  { name: 'Miles', shift: 'AMER', active: true, load: '4 cases' },
  { name: 'Reva', shift: 'APAC', active: false, load: 'handover in 35m' },
];

const workflows = [
  { title: 'Financial fraud sweep', progress: 72, owner: 'Miles' },
  { title: 'Identity escalation backlog', progress: 44, owner: 'Reva' },
  { title: 'Policy update rollout', progress: 18, owner: 'Policy' },
];

import Container from '@/app/admin/Container';

export default async function AdminReportsPage() {
  await requireAdminUser();

  return (
    <Container>
      <div className="space-y-10">
        <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trust &amp; Safety</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">Incident + report queue</h1>
              <p className="text-sm text-slate-400">Monitor live intake, severity, and analyst capacity.</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Playbooks</button>
              <button className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white">Export CSV</button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-sm text-slate-400">{card.detail}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live feed</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Open investigations</h2>
                </div>
                <button className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10">
                  Assign
                </button>
              </div>
              <div className="mt-6 divide-y divide-white/5">
                {openReports.map((report) => (
                  <div key={report.id} className="flex flex-wrap items-center gap-4 py-4 text-sm text-slate-300">
                    <div className="min-w-[120px]">
                      <p className="text-white">{report.id}</p>
                      <p className="text-xs text-slate-500">{report.age} old</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{report.type}</p>
                      <p className="text-xs text-slate-400">{report.user} • {report.location}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[report.severity]}`}
                    >
                      {report.severity}
                    </span>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{report.channel}</div>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/10">
                        Triage
                      </button>
                      <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white hover:bg-white/10">
                        Escalate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/40 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Workflows</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Automation + review lanes</h3>
                </div>
                <span className="rounded-full border border-emerald-300/30 px-3 py-1 text-xs text-emerald-100">
                  Pilot v2
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {workflows.map((lane) => (
                  <div key={lane.title} className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <div>
                        <p className="font-semibold text-white">{lane.title}</p>
                        <p className="text-xs text-slate-500">Owner: {lane.owner}</p>
                      </div>
                      <p className="text-lg font-semibold text-white">{lane.progress}%</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${lane.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Regional heatmap</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Where risk is spiking</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                {heatmap.map((row) => (
                  <li key={row.region} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{row.region}</p>
                      <p className="text-xs text-slate-500">Spike {row.spike}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-rose-200">{row.backlog} backlog</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Analyst coverage</p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                {analysts.map((analyst) => (
                  <div key={analyst.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{analyst.name}</p>
                      <p className="text-xs text-slate-500">{analyst.shift} shift</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{analyst.active ? 'Online' : 'Handover'}</p>
                      <p className="text-white">{analyst.load}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
