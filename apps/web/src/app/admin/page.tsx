import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card } from '@lovedate/ui';
import dynamic from 'next/dynamic';

const AdminMetrics = dynamic(() => import('./AdminMetrics'), { ssr: false });
const UserTable = dynamic(() => import('./UserTable'), { ssr: false });

export default async function AdminDashboardPage() {
  const session = getSession();
  // Only allow admin@amoravibe.com
  if (!session || session.user?.email !== 'admin@amoravibe.com') {
    redirect('/login?next=/admin');
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <Card className="space-y-4 mb-8">
        <h1 className="font-display text-3xl text-ink-900">Admin Dashboard</h1>
        <p className="text-ink-700">Welcome, admin! Here you can manage users, view metrics, and perform admin actions.</p>
      </Card>
      <AdminMetrics />
      <UserTable />
    </main>
  );
}
