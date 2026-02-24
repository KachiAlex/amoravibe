

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';

// Mock getMessages function
function getMessages(userId: string) {
  return [
    {
      id: '1',
      from: 'Alice',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      preview: 'Hey, how are you?',
      time: '2m ago',
      unread: true,
    },
    {
      id: '2',
      from: 'Bob',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      preview: 'Let’s catch up soon!',
      time: '10m ago',
      unread: false,
    },
    {
      id: '3',
      from: 'Clara',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      preview: 'Sent you the docs.',
      time: '1h ago',
      unread: true,
    },
  ];
}

export default function DashboardMessagesPage() {
  const messages = getMessages('demo-user');
  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <DashboardLayout>
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Sidebar activeTab="messages" />
        <main className="flex-1 px-12 py-10">
          <Header userName="John Doe" />
          <div className="mb-10 flex justify-center gap-8">
            <StatsCards stats={{ matches: 24, chats: 18, views: 156 }} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Messages</h2>
          <div className="flex items-center mb-6">
            <button className="rounded-full bg-fuchsia-600 text-white px-6 py-2 font-semibold mr-4">All</button>
            <button className="rounded-full bg-white text-fuchsia-600 border border-fuchsia-200 px-6 py-2 font-semibold">
              Unread ({unreadCount})
            </button>
          </div>
          <div className="space-y-4">
            {messages.map(m => (
              <a
                key={m.id}
                href={`/dashboard/messages/${m.id}`}
                className={`flex items-center p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer ${m.unread ? 'border-l-4 border-fuchsia-500' : ''}`}
              >
                <img src={m.avatar} alt={`${m.from} avatar`} className="w-14 h-14 rounded-full object-cover mr-4" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{m.from}</span>
                    <span className="text-xs text-gray-500">{m.time}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{m.preview}</div>
                </div>
                {m.unread && <span className="ml-4 w-3 h-3 rounded-full bg-fuchsia-500" />}
              </a>
            ))}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}