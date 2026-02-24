
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import DiscoverPanel from '../components/DiscoverPanel';

export default function DiscoverPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Sidebar activeTab="discover" />
      <main className="flex-1 px-12 py-10">
        <Header userName="John Doe" />
        <div className="mb-10 flex justify-center gap-8">
          <StatsCards stats={{ matches: 24, chats: 18, views: 156 }} />
        </div>
        <h2 className="text-3xl font-bold mb-8">Discover New People</h2>
      <DashboardLayout>
        <DiscoverPanel />
      </DashboardLayout>
      </main>
    </div>
  );
}
