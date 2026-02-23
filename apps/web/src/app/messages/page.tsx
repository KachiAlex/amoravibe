import MessagesList from '../dashboard/components/MessagesList';
import { getMessages } from '@/lib/dev-data';

export default function MessagesPage() {
  // For demo, use a fixed userId
  const messages = getMessages('demo-user');
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <MessagesList messages={messages} />
    </main>
  );
}