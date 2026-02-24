"use client";
import React, { useEffect, useState } from 'react';

type Match = {
  id: string;
  name: string;
  age?: number;
  jobTitle?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  matchPercent?: number;
  isNew?: boolean;
  accepted?: boolean;
};

export default function MatchesListClient({ initialMatches = [] }: { initialMatches?: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // If no initial matches, fetch from API
    if (!initialMatches || initialMatches.length === 0) {
      fetchMatches();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMatches() {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/matches`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    setAcceptingIds((s) => new Set(s).add(id));
    // optimistic UI: mark accepted locally
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, accepted: true } : m)));
    // optimistic stats update for immediate feedback
    try {
      // dispatch a small optimistic increment (1 match accepted)
      window.dispatchEvent(new CustomEvent('dashboard:stats:optimistic', { detail: { matches: 1 } }));
    } catch (e) {
      // noop in non-browser env
    }
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/matches/${id}/like`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('post failed');
      // refresh list from server to stay in sync
      await fetchMatches();
      // notify other dashboard pieces (stats) to refresh
      try {
        window.dispatchEvent(new CustomEvent('dashboard:stats:refresh'));
      } catch (e) {
        // noop in non-browser env
      }
    } catch (e) {
      // revert on error
      setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, accepted: false } : m)));
    } finally {
      setAcceptingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <section aria-labelledby="matches-heading">
      {loading && <p className="text-sm text-ink-300">Loading…</p>}
      <div className="flex gap-8 overflow-x-auto pb-2" style={{scrollSnapType:'x mandatory'}}>
        {matches.map((m) => (
          <div
            key={m.id}
            className="min-w-[380px] max-w-[400px] bg-white rounded-3xl shadow-lg flex flex-col p-0 mr-4 scroll-snap-align-start relative"
            style={{scrollSnapAlign:'start'}}>
            <div className="relative">
              <img src={m.avatar} alt="" className="w-full h-64 object-cover rounded-t-3xl" />
              {typeof m.matchPercent === 'number' && (
                <span className="absolute top-4 left-4 bg-fuchsia-500 text-white text-sm font-semibold rounded-full px-4 py-1 shadow">{m.matchPercent}% Match</span>
              )}
              {m.isNew && (
                <span className="absolute top-4 right-4 bg-purple-500 text-white text-sm font-semibold rounded-full px-4 py-1 shadow">New Match</span>
              )}
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="font-bold text-2xl mb-1">{m.name}{m.age ? `, ${m.age}` : ''}</div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                {m.jobTitle && <><span className="inline-block">💼</span> {m.jobTitle}</>}
                {m.location && <><span className="inline-block">📍</span> {m.location}</>}
              </div>
              {m.bio && <div className="text-gray-700 mb-2">{m.bio}</div>}
              {Array.isArray(m.interests) && m.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.interests.map((tag) => (
                    <span key={tag} className="bg-fuchsia-100 text-fuchsia-700 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

