import Header from '../components/Header';
import { getSession } from '@/lib/session';
import { getMessages as getDevMessages } from '@/lib/dev-data';
import { MessagesClient } from './MessagesClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardMessagesPage() {
  const session = await getSession();
  const userId = session?.userId ?? 'demo-user';
  const messages = getDevMessages(userId);

  let displayName = 'You';
  if (session?.userId) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { displayName: true, name: true, email: true },
    });
    displayName = user?.displayName ?? user?.name ?? user?.email?.split('@')[0] ?? displayName;
  }

  return (
    <div className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
      <Header userName={displayName} />

      <MessagesClient initialMessages={messages as any} userName={displayName} />
    </div>
  );
}