
import { getSession } from '@/lib/session';
import Header from '../components/Header';
import DiscoverPanel from '../components/DiscoverPanel';

export const dynamic = 'force-dynamic';

export default async function DiscoverPage() {
  const session = await getSession();
  let displayName = 'You';

  // TODO: hydrate displayName with dashboard data if needed

  return (
    <main className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
      <Header userName={displayName} />

      <div className="mt-8">
        <DiscoverPanel />
      </div>
    </main>
  );
}
