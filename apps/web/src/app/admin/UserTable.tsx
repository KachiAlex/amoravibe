
"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@lovedate/ui';

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/trust/admin/users')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (id: string) => {
    setActionLoading(id + '-verify');
    await fetch(`/api/trust/admin/users/${id}/verify`, { method: 'PATCH' });
    fetchUsers();
    setActionLoading(null);
  };

  const handleBan = async (id: string, ban: boolean) => {
    setActionLoading(id + '-ban');
    await fetch(`/api/trust/admin/users/${id}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ban }),
    });
    fetchUsers();
    setActionLoading(null);
  };

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <div className="mb-2 text-xs text-gray-500">Total users: {total}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Email</th>
            <th className="py-2">Display Name</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0">
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.displayName}</td>
              <td className="py-2">{user.role || (user.email === 'admin@amoravibe.com' ? 'admin' : 'user')}</td>
              <td className="py-2">{user.banned ? 'banned' : 'active'}</td>
              <td className="py-2 flex gap-2">
                <button
                  className="text-xs text-green-600 mr-2"
                  disabled={actionLoading === user.id + '-verify' || user.isVerified}
                  onClick={() => handleVerify(user.id)}
                >
                  {user.isVerified ? 'Verified' : actionLoading === user.id + '-verify' ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  className="text-xs text-red-600"
                  disabled={actionLoading === user.id + '-ban'}
                  onClick={() => handleBan(user.id, !user.banned)}
                >
                  {actionLoading === user.id + '-ban'
                    ? (user.banned ? 'Unbanning...' : 'Banning...')
                    : user.banned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
