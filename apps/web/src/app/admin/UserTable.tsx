
"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@lovedate/ui';

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    fetch(`/api/trust/admin/users?${params.toString()}`)
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
    // clear selected user when list changes
    setSelectedUser(null);
  }, [search, limit, offset]);

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

  const viewUser = async (id: string) => {
    setSelectedUser(null);
    setActionLoading(id + '-view');
    try {
      const res = await fetch(`/api/trust/admin/users/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSelectedUser(data.user || data);
    } catch (err) {
      setError(String(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="text-xs text-gray-500">Total users: {total}</div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          placeholder="Search by name, email or city"
          className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none"
        />

        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
        </select>

        <div className="ml-auto text-xs text-gray-500">Showing {Math.min(total, offset + 1)} - {Math.min(total, offset + limit)} of {total}</div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

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
                  className="text-xs text-sky-600 mr-2"
                  disabled={actionLoading === user.id + '-view'}
                  onClick={() => viewUser(user.id)}
                >
                  {actionLoading === user.id + '-view' ? 'Loading…' : 'View'}
                </button>
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

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Prev
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </button>
        </div>
        <div className="text-xs text-gray-500">Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}</div>
      </div>

      {selectedUser && (
        <div className="mt-6 rounded-lg border bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{selectedUser.displayName}</div>
              <div className="text-xs text-gray-600">{selectedUser.email}</div>
            </div>
            <div className="text-xs text-gray-500">{selectedUser.createdAt}</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-700">
            <div>City: {selectedUser.city || '—'}</div>
            <div>Verified: {selectedUser.isVerified ? 'Yes' : 'No'}</div>
            <div>Banned: {selectedUser.banned ? 'Yes' : 'No'}</div>
            <div>ID: <code className="text-xs">{selectedUser.id}</code></div>
          </div>
        </div>
      )}
    </Card>
  );
}
