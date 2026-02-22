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
      const res = await fetch('/api/matches');
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
    // optimistic update
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, accepted: true } : m)));
    try {
      await fetch(`/api/matches/${id}/like`, { method: 'POST' });
    } catch (e) {
      // revert on error
      setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, accepted: false } : m)));
    }
  }

  return (
    <section aria-labelledby="matches-heading">
      <div className="stat-card p-4">
        <h2 id="matches-heading" className="text-lg font-semibold">Matches</h2>
        {loading && <p className="text-sm text-ink-300">Loading…</p>}
        <ul className="mt-3 space-y-3">
          {matches.map((m) => (
            <li key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={m.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium">{m.name}</div>
                  {m.tagline && <div className="text-sm text-ink-300">{m.tagline}</div>}
                </div>
              </div>
              <div>
                {m.accepted ? (
                  <span className="text-sm text-green-600">Accepted</span>
                ) : (
                  <button onClick={() => handleAccept(m.id)} className="btn btn-sm">Like</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
