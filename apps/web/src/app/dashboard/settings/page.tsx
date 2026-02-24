
import DashboardLayout from "../layout";
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Sidebar activeTab="settings" />
      <main className="flex-1 px-12 py-10">
        <Header userName="John Doe" />
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
      </main>
    </div>
    </DashboardLayout>
  );
}
