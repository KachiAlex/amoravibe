import React from 'react';

type Stats = { matches: number; chats: number; views: number };

export default function StatsCards({ stats = { matches: 0, chats: 0, views: 0 } }: { stats?: Stats }) {
  return (
    <section className="flex flex-col md:flex-row gap-6 mb-10" aria-label="Summary statistics">
      <div className="flex-1 stat-card" role="region" aria-label="Total matches">
        <span className="text-2xl mb-2" aria-hidden>
          💜
        </span>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold gradient-clip">{stats.matches}</span>
          <span className="text-rose-500 font-semibold">+12 this week</span>
        </div>
        <span className="text-muted-500 mt-1">Total Matches</span>
      </div>
      <div className="flex-1 stat-card" role="region" aria-label="Active chats">
        <span className="text-2xl mb-2" aria-hidden>
          💬
        </span>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold gradient-clip">{stats.chats}</span>
          <span className="text-rose-300 font-semibold">+5 today</span>
        </div>
        <span className="text-muted-500 mt-1">Active Chats</span>
      </div>
      <div className="flex-1 stat-card" role="region" aria-label="Profile views">
        <span className="text-2xl mb-2" aria-hidden>
          ⭐
        </span>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold gradient-clip">{stats.views}</span>
          <span className="text-fuchsia-500 font-semibold">Top 10%</span>
        </div>
        <span className="text-muted-500 mt-1">Profile Views</span>
      </div>
    </section>
  );
}
