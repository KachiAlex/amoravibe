"use client";

import nextDynamic from 'next/dynamic';

const AdminMetrics = nextDynamic(() => import('./AdminMetrics'), { ssr: false });
const UserTable = nextDynamic(() => import('./UserTable'), { ssr: false });
const ActivityLog = nextDynamic(() => import('./ActivityLog'), { ssr: false });
const TrustOverride = nextDynamic(() => import('./TrustOverride'), { ssr: false });
const SystemHealth = nextDynamic(() => import('./SystemHealth'), { ssr: false });

export function AdminWidgetsClient() {
  return (
    <>
      <AdminMetrics />
      <UserTable />
      <TrustOverride />
      <ActivityLog />
      <SystemHealth />
    </>
  );
}
