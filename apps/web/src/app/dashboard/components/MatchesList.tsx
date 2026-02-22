import React from 'react';
import type { Match } from '../types';

export default function MatchesList({ matches }: { matches: Match[] }) {
  return (
    <section aria-label="Matches" className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
        {matches.map((m) => (
          <div key={m.id} role="listitem" className="stat-card flex items-center gap-4">
            <img src={m.avatar} alt={`${m.name} avatar`} className="w-20 h-20 rounded-2xl object-cover" />
            <div>
              <span className="bg-gradient-to-br from-brand-violet to-brand-pink text-white text-xs rounded-full px-2 py-0.5 font-semibold">{m.matchPercent}% Match</span>
              <h3 className="text-lg font-bold mt-2 text-ink-700">{m.name}</h3>
              <span className="text-muted-500">{m.tagline}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
