
import Sidebar from '../components/Sidebar';
import ProfilePanel from '../components/ProfilePanel';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Sidebar />
        <main className="flex-1 px-12 py-10 flex flex-col">
          <ProfilePanel />
        </main>
      </div>
    </DashboardLayout>
  );
}
