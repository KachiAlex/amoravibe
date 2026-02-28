import Link from 'next/link';
import Header from '../components/Header';
import { getSession } from '@/lib/session';
import { getMessages as getDevMessages } from '@/lib/dev-data';
import { MessagesClient } from './MessagesClient';

export const dynamic = 'force-dynamic';

export default async function DashboardMessagesPage() {
  const session = await getSession();
  const userId = session?.userId ?? 'demo-user';
  const messages = getDevMessages(userId);

  return (
    <div className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
      <Header userName={session?.profile?.displayName ?? 'John Doe'} />

      <MessagesClient initialMessages={messages as any} userName={session?.profile?.displayName ?? 'John Doe'} />
    </div>
  );
}