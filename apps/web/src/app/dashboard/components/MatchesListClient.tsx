"use client";
import React, { useEffect, useState } from 'react';

type Match = {
  id: string;
  name: string;
  avatar?: string;
  tagline?: string;
  matchPercent?: number;
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
      setMatches(data.matches || []);
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
      <div className="stat-card p-4">
        <h2 id="matches-heading" className="text-lg font-semibold mb-4">Matches</h2>
        {loading && <p className="text-sm text-ink-300">Loading…</p>}
        <div className="flex gap-6 overflow-x-auto pb-2" style={{scrollSnapType:'x mandatory'}}>
          {matches.map((m) => (
            <div
              key={m.id}
              className="min-w-[320px] max-w-[340px] bg-white rounded-xl shadow flex flex-col items-center p-6 mr-2 scroll-snap-align-start"
              style={{scrollSnapAlign:'start'}}
            >
              <img src={m.avatar} alt="" className="w-24 h-24 rounded-full object-cover mb-3" />
              <div className="font-bold text-xl mb-1">{m.name}</div>
              {m.tagline && <div className="text-md text-ink-400 mb-2">{m.tagline}</div>}
              {typeof m.matchPercent === 'number' && (
                <div className="text-sm text-blue-500 mb-2">Match: {m.matchPercent}%</div>
              )}
              <div className="flex gap-3 mt-4">
                {m.accepted ? (
                  <span className="text-sm text-green-600">Liked</span>
                ) : (
                  <>
                    <button
                      disabled={acceptingIds.has(m.id)}
                      onClick={() => handleAccept(m.id)}
                      className="btn btn-primary px-6 py-2 rounded-full font-semibold"
                    >
                      {acceptingIds.has(m.id) ? '...' : 'Like'}
                    </button>
                    <button
                      className="btn btn-outline px-6 py-2 rounded-full font-semibold"
                      onClick={() => setMatches((prev) => prev.filter((x) => x.id !== m.id))}
                    >
                      Pass
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

