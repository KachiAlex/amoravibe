import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card } from '@lovedate/ui';
import { createLovedateApi } from '@lovedate/api';
import dynamic from 'next/dynamic';
import { resolveTrustApiBase } from '@/lib/trust-upstream';

const AdminMetrics = dynamic(() => import('./AdminMetrics'), { ssr: false });
const UserTable = dynamic(() => import('./UserTable'), { ssr: false });
const ActivityLog = dynamic(() => import('./ActivityLog'), { ssr: false });
const TrustOverride = dynamic(() => import('./TrustOverride'), { ssr: false });
const SystemHealth = dynamic(() => import('./SystemHealth'), { ssr: false });

const upstreamBase = resolveTrustApiBase();

export default async function AdminDashboardPage() {
  const session = getSession();
  if (!session) {
    redirect('/login?next=/admin');
  }

  // Ensure user is an admin based on the local mock store/session
  const api = createLovedateApi({ baseUrl: upstreamBase });
  let user: any = null;
  try {
    const snapshot = await api.fetchTrustSnapshot(session!.userId);
    user = snapshot.user;
  } catch (e) {
    redirect('/login?next=/admin');
  }
  if (!user || user.email !== 'admin@amoravibe.com') {
    redirect('/login?next=/admin');
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Card className="space-y-4 mb-8">
        <div id="user-table-placeholder">
          <p>Loading user data...</p>
        </div>
      </Card>
      <AdminMetrics />
      <UserTable />
      <TrustOverride />
      <ActivityLog />
      <SystemHealth />
    </main>
  );
}
