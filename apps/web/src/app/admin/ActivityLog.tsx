"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@lovedate/ui';

export default function ActivityLog() {
  const [log, setLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/trust/admin/activity-log')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setLog(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Activity Log</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <ul className="text-xs">
        {log.length === 0 && !loading && <li>No activity found.</li>}
        {log.map((entry, i) => (
          <li key={i} className="mb-1">
            <span className="font-mono text-gray-500">[{entry.timestamp}]</span> {entry.message}
          </li>
        ))}
      </ul>
    </Card>
  );
}
