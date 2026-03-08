import type { ReactNode } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

const NAV_LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/spaces', label: 'Spaces' },
  { href: '/admin/system', label: 'System' },
];

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-white/10 bg-slate-900/70 backdrop-blur">
          <div className="px-6 py-8 border-b border-white/10">
            <p className="text-xs tracking-[0.4em] uppercase text-slate-400">Amoravibe</p>
            <h1 className="mt-2 text-xl font-semibold text-white">Admin Control</h1>
          </div>
          <nav className="px-4 py-6 space-y-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 bg-slate-950/80">
          <div className="border-b border-white/5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 px-10 py-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Command Deck</h2>
            <LogoutButton />
          </div>
          <div className="px-10 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
