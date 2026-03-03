
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { DiscoverClient } from './DiscoverClient';
import { getProfile } from '@/lib/dev-data';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DiscoverPage() {
  const session = await getSession();
  const profile = session?.userId ? getProfile(session.userId) : null;
  let displayName = 'You';

  if (session?.userId) {
    const user = await db.user.findUnique({ where: { id: session.userId } });
    displayName = user?.displayName ?? user?.name ?? displayName;
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
      <Header userName={displayName} />

      <div className="mt-6">
        <StatsCards stats={{ matches: 24, chats: 18, views: 156 }} />
      </div>

      <section className="mt-10">
        <div className="rounded-[28px] border border-white/70 bg-gradient-to-r from-white via-pink-50 to-purple-50 shadow-[0_20px_70px_rgba(110,55,255,0.12)]">
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white text-2xl shadow-lg">
              ⎈
            </div>
            <h2 className="font-display text-3xl text-ink-900">Explore New Connections</h2>
            <p className="max-w-2xl text-base text-ink-700">
              Swipe through profiles and find people who share your interests and values. Set your discovery preferences to tailor the journey.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/matches"
                className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200 hover:shadow-xl"
              >
                Start Discovering
              </Link>
              <Link
                href="/dashboard/settings"
                className="rounded-full border border-fuchsia-100 bg-white px-5 py-3 text-sm font-semibold text-fuchsia-700 hover:border-fuchsia-200"
              >
                Adjust Preferences
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DiscoverClient userId={session?.userId ?? null} orientation={profile?.orientation} />
    </main>
  );
}
