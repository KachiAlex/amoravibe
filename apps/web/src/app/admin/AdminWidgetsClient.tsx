"use client";

import nextDynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import type { AdminMetricsSnapshot } from '@/lib/admin-metrics';

const AdminMetrics = nextDynamic(() => import('./AdminMetrics'), { 
  ssr: true,
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse" />
});
const UserTable = nextDynamic(() => import('./UserTable'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded animate-pulse" />
});
const ActivityLog = nextDynamic(() => import('./ActivityLog'), { 
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded animate-pulse" />
});
const TrustOverride = nextDynamic(() => import('./TrustOverride'), { 
  ssr: false,
  loading: () => <div className="h-24 bg-gray-100 rounded animate-pulse" />
});
const SystemHealth = nextDynamic(() => import('./SystemHealth'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse" />
});

type AdminWidgetsClientProps = {
  initialMetrics: AdminMetricsSnapshot;
};

export function AdminWidgetsClient({ initialMetrics }: AdminWidgetsClientProps) {
  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    users: true,
    override: false,
    activity: false,
    health: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => toggleSection('metrics')}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
        >
          {expandedSections.metrics ? '▼' : '▶'} Platform Metrics
        </button>
        {expandedSections.metrics && (
          <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse mt-4" />}>
            <AdminMetrics initialMetrics={initialMetrics} />
          </Suspense>
        )}
      </div>

      <div className="mb-8">
        <button
          onClick={() => toggleSection('users')}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
        >
          {expandedSections.users ? '▼' : '▶'} User Management
        </button>
        {expandedSections.users && (
          <Suspense fallback={<div className="h-96 bg-gray-100 rounded animate-pulse mt-4" />}>
            <UserTable />
          </Suspense>
        )}
      </div>

      <div className="mb-8">
        <button
          onClick={() => toggleSection('override')}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
        >
          {expandedSections.override ? '▼' : '▶'} Trust Override
        </button>
        {expandedSections.override && (
          <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse mt-4" />}>
            <TrustOverride />
          </Suspense>
        )}
      </div>

      <div className="mb-8">
        <button
          onClick={() => toggleSection('activity')}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
        >
          {expandedSections.activity ? '▼' : '▶'} Activity Log
        </button>
        {expandedSections.activity && (
          <Suspense fallback={<div className="h-48 bg-gray-100 rounded animate-pulse mt-4" />}>
            <ActivityLog />
          </Suspense>
        )}
      </div>

      <div className="mb-8">
        <button
          onClick={() => toggleSection('health')}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
        >
          {expandedSections.health ? '▼' : '▶'} System Health
        </button>
        {expandedSections.health && (
          <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse mt-4" />}>
            <SystemHealth />
          </Suspense>
        )}
      </div>
    </>
  );
}
