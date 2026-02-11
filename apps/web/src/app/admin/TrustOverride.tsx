"use client";
import React, { useState } from 'react';
import { Card } from '@lovedate/ui';

export default function TrustOverride() {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/trust/admin/users/${userId}/verify`, { method: 'PATCH' });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Trust/Verification Override</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 text-sm rounded"
          placeholder="User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button
          className="text-xs text-green-600 border px-3 py-1 rounded"
          disabled={!userId || loading}
          onClick={handleVerify}
        >
          {loading ? 'Verifying...' : 'Mark Verified'}
        </button>
      </div>
      {error && <div className="text-red-600 text-xs">{error}</div>}
      {result && <div className="text-green-700 text-xs">User {result.id} marked as verified.</div>}
    </Card>
  );
}
