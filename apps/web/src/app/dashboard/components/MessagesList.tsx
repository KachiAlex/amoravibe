"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Conv = {
  otherId: string;
  otherName: string;
  avatar?: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

export default function MessagesList() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/messages/conversations')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setConvs(data.conversations || []);
      })
      .catch(() => { if (mounted) setError('Failed to load conversations'); })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (error) return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
  return (
    <section aria-label="Messages">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <span className="text-sm text-gray-500">{loading ? 'Loading…' : `${convs.length} conversations`}</span>
      </div>
      <div className="space-y-3" role="list">
        {convs.map((c) => (
            <Link href={`/messages/${c.otherId}`} key={c.otherId} role="listitem" className="block cursor-pointer stat-card flex items-center gap-4 p-4 rounded-2xl bg-white shadow border border-gray-100 hover:bg-gray-50">
              <div className="relative">
                <Image
                  src={c.avatar ?? '/images/default-avatar.png'}
                  alt={`${c.otherName} avatar`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  unoptimized
                />
                {c.unread > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{c.unread}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <strong className="text-gray-900 truncate">{c.otherName}</strong>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(c.lastAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 break-words truncate">{c.lastMessage}</p>
              </div>
            </Link>
        ))}
        {convs.length === 0 && !loading && <div className="text-sm text-gray-500">No conversations yet</div>}
      </div>
    </section>
  );
}
