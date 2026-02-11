"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@lovedate/ui';

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/trust/admin/health')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setHealth(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">System Health</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {health && (
        <div className="text-xs">
          <div>Status: <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>{health.status}</span></div>
        </div>
      )}
    </Card>
  );
}
