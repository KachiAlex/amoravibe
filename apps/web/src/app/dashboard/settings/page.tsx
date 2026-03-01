import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  let displayName = 'You';
  
  if (session?.userId) {
    const user = await db.user.findUnique({ where: { id: session.userId } });
    displayName = user?.displayName ?? user?.name ?? 'You';
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      <main id="settings-main" className="flex-1 flex flex-col min-h-screen h-screen">
        <div className="flex-1 w-full min-h-screen h-full md:rounded-l-xl shadow-lg bg-white/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
            <Header userName={displayName} />
            <div className="mb-10 flex justify-center gap-8">
              <StatsCards stats={{ matches: 24, chats: 18, views: 156 }} />
            </div>
            <h2 className="text-3xl font-bold mb-8">Settings</h2>
            <div className="bg-white rounded-2xl shadow p-8 max-w-2xl mx-auto">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center py-4 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-700 flex-1">Email &amp; Password</span>
                    <span className="text-gray-400">&rarr;</span>
                  </div>
                  <div className="flex items-center py-4 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-700 flex-1">Privacy Settings</span>
                    <span className="text-gray-400">&rarr;</span>
                  </div>
                  <div className="flex items-center py-4 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-700 flex-1">Notifications</span>
                    <span className="text-gray-400">&rarr;</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Preferences</h3>
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center py-4 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-700 flex-1">Language</span>
                    <span className="text-gray-400">&rarr;</span>
                  </div>
                  <div className="flex items-center py-4 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-gray-700 flex-1">Theme</span>
                    <span className="text-gray-400">&rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
