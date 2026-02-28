import { getSession } from '@/lib/session';
import { MatchesClient } from './MatchesClient';

export const dynamic = 'force-dynamic';

export default async function MatchesPage(props: { searchParams?: { userId?: string } }) {
  const resolvedParams = await Promise.resolve(props.searchParams ?? {});
  const session = await getSession();
  const userId = resolvedParams.userId ?? session?.userId ?? null;

  return <MatchesClient initialUserId={userId} />;
}
