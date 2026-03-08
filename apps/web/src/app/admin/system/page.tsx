import { requireAdminUser } from '@/lib/admin-auth';
import Container from '@/app/admin/Container';

export const dynamic = 'force-dynamic';

const healthCards = [
  { label: 'API latency', value: '182 ms', trend: '+12 ms vs 24h', status: 'healthy' },
  { label: 'DB write queue', value: '1.3k ops', trend: '-8% vs wk', status: 'watch' },
  { label: 'Realtime fanout', value: '97.1%', trend: '+0.6 pts', status: 'healthy' },
  { label: 'Incidents', value: '0 open', trend: 'last 6h window', status: 'healthy' },
];

const statusColors: Record<string, string> = {
  healthy: 'text-emerald-300',
  watch: 'text-amber-300',
  critical: 'text-rose-300',
};

const services = [
  { name: 'Edge worker', latency: '112 ms', status: 'healthy', region: 'global', updated: '3m' },
  { name: 'Prisma cluster', latency: '241 ms', status: 'watch', region: 'eu-central', updated: '1m' },
  { name: 'Vector search', latency: '389 ms', status: 'critical', region: 'us-east', updated: '45s' },
  { name: 'Queue broker', latency: '78 ms', status: 'healthy', region: 'eu-west', updated: '2m' },
];

const tasks = [
  { title: 'Failover rehearsal', owner: 'Platform', eta: 'Today 17:00', state: 'Scheduled maintenance' },
  { title: 'Queue drain to cold storage', owner: 'Data infra', eta: 'In progress', state: 'Background job' },
  { title: 'Policy rollout to edge', owner: 'Security', eta: 'Tomorrow 09:00', state: 'Deploy ready' },
];

const telemetry = [
  { label: 'Auth proxy', value: '99.982%', detail: 'uptime (30d)' },
  { label: 'Push gateway', value: '312ms', detail: 'p95 delivery' },
  { label: 'Trust webhooks', value: '478', detail: 'events last hour' },
  { label: 'Realtime sockets', value: '8.1k', detail: 'online members' },
];

const guardrails = [
  { label: 'Last failover', value: '4 days ago', detail: 'us-east → eu-west', status: 'healthy' },
  { label: 'Error budget burn', value: '22%', detail: 'Rolling 30d', status: 'watch' },
  { label: 'Backups verified', value: '02:10 UTC', detail: 'Snapshots healthy', status: 'healthy' },
];

const alerts = [
  { title: 'Vector DB p95 latency 480ms', detail: 'Auto-mitigating via read replica rebalance.', severity: 'critical' },
  { title: 'Queue broker retry spike (x1.8)', detail: 'Watching AMER ingress, no drops.', severity: 'watch' },
  { title: 'Push gateway rolling deployment', detail: 'Gradual ramp to 50% complete.', severity: 'healthy' },
];

export default async function AdminSystemPage() {
  await requireAdminUser();

  return (
    <Container>
      <div className="space-y-10">
        <header className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">System health</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">Infra + reliability console</h1>
              <p className="text-sm text-slate-400">Latency, uptime, queues, and critical maintenance windows.</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Pager duty</button>
              <button className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white">Create incident</button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {healthCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
              <p className={`mt-2 text-sm ${statusColors[card.status]}`}>{card.trend}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Core services</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Live status</h2>
                </div>
                <button className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10">Refresh</button>
              </div>
              <div className="mt-6 divide-y divide-white/5">
                {services.map((svc) => (
                  <div key={svc.name} className="grid gap-4 py-4 text-sm text-slate-300 md:grid-cols-4">
                    <div>
                      <p className="font-semibold text-white">{svc.name}</p>
                      <p className="text-xs text-slate-500">{svc.region}</p>
                    </div>
                    <p className="text-white">{svc.latency}</p>
                    <p className={`uppercase tracking-[0.3em] ${statusColors[svc.status]}`}>{svc.status}</p>
                    <p className="text-xs text-slate-500">Updated {svc.updated} ago</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Maintenance</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Workboard</h3>
                </div>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">Change freeze: off</span>
              </div>
              <div className="mt-6 space-y-4">
                {tasks.map((task) => (
                  <div key={task.title} className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="text-xs text-slate-500">Owner {task.owner}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{task.eta}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{task.state}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Telemetry</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Signals</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                {telemetry.map((probe) => (
                  <li key={probe.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{probe.label}</p>
                      <p className="text-xs text-slate-500">{probe.detail}</p>
                    </div>
                    <p className="text-lg font-semibold text-white">{probe.value}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Guardrails</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Safety metrics</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                {guardrails.map((g) => (
                  <li key={g.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{g.label}</p>
                      <p className="text-xs text-slate-500">{g.detail}</p>
                    </div>
                    <p className={`text-sm ${statusColors[g.status]}`}>{g.value}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Alerts</p>
              <h3 className="mt-2 text-xl font-semibold text-white">On‑call noise</h3>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                {alerts.map((a) => (
                  <li key={a.title} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.detail}</p>
                    </div>
                    <span className={`uppercase tracking-[0.3em] ${statusColors[a.severity]}`}>{a.severity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
