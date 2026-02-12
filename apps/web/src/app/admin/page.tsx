
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

  // Fetch user by ID to check email
  const api = createLovedateApi({ baseUrl: upstreamBase });
  let user: any = null;
  try {
    // Use fetchTrustSnapshot to get user details
    const snapshot = await api.fetchTrustSnapshot(session!.userId);
    user = snapshot.user;
  } catch (e) {
    // If user fetch fails, treat as not authorized
    redirect('/login?next=/admin');
  }
  if (!user || user.email !== 'admin@amoravibe.com') {
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
      <TrustOverride />
      <ActivityLog />
      <SystemHealth />
    </main>
  );
}
