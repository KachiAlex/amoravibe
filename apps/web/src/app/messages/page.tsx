import MessagesList from '../dashboard/components/MessagesList';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <MessagesList />
    </main>
  );
}