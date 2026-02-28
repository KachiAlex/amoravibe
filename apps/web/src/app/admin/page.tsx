import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card } from '@lovedate/ui';
import { createLovedateApi } from '@lovedate/api';
import { resolveTrustApiBase } from '@/lib/trust-upstream';
import { getAdminMetrics } from '@/lib/admin-metrics';
import { AdminWidgetsClient } from './AdminWidgetsClient';

export const dynamic = 'force-dynamic';

const upstreamBase = resolveTrustApiBase();

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/admin');
  }

  const trustMockEnabled =
    process.env.TRUST_API_MOCK === '1' || process.env.TRUST_API_MOCK === 'true';

  let isAdmin = false;

  if (trustMockEnabled) {
    isAdmin = session.userId === 'admin@amoravibe.com';
  } else {
    // Ensure user is an admin based on the upstream trust snapshot
    const api = createLovedateApi({ baseUrl: upstreamBase });
    try {
      const snapshot = await api.fetchTrustSnapshot(session.userId);
      isAdmin = snapshot.user?.email === 'admin@amoravibe.com';
    } catch (e) {
      redirect('/login?next=/admin');
    }
  }

  if (!isAdmin) {
    redirect('/login?next=/admin');
  }

  const metrics = await getAdminMetrics();

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Card className="space-y-4 mb-8">
        <div id="user-table-placeholder">
          <p>Loading user data...</p>
        </div>
      </Card>
      <AdminWidgetsClient initialMetrics={metrics} />
    </main>
  );
}
