"use client";

import nextDynamic from 'next/dynamic';
import type { AdminMetricsSnapshot } from '@/lib/admin-metrics';

const AdminMetrics = nextDynamic(() => import('./AdminMetrics'), { ssr: false });
const UserTable = nextDynamic(() => import('./UserTable'), { ssr: false });
const ActivityLog = nextDynamic(() => import('./ActivityLog'), { ssr: false });
const TrustOverride = nextDynamic(() => import('./TrustOverride'), { ssr: false });
const SystemHealth = nextDynamic(() => import('./SystemHealth'), { ssr: false });

type AdminWidgetsClientProps = {
  initialMetrics: AdminMetricsSnapshot;
};

export function AdminWidgetsClient({ initialMetrics }: AdminWidgetsClientProps) {
  return (
    <>
      <AdminMetrics initialMetrics={initialMetrics} />
      <UserTable />
      <TrustOverride />
      <ActivityLog />
      <SystemHealth />
    </>
  );
}
