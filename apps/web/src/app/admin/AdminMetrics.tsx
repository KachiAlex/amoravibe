"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@lovedate/ui';

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/trust/admin/metrics')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setMetrics(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="mb-8 p-6">
      <h2 className="text-xl font-bold mb-4">Platform Metrics</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <div className="text-xs text-gray-500">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{metrics.signupsThisWeek}</div>
            <div className="text-xs text-gray-500">Signups This Week</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{metrics.bannedUsers}</div>
            <div className="text-xs text-gray-500">Banned Users</div>
          </div>
        </div>
      )}
    </Card>
  );
}
