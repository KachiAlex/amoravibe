"use client";
import React, { useEffect, useState } from 'react';

type Stats = { matches: number; chats: number; views: number };

export default function StatsCards({ stats: initial = { matches: 0, chats: 0, views: 0 } }: { stats?: Stats }) {
  const [stats, setStats] = useState<Stats>(initial);
  const [display, setDisplay] = useState<Stats>(initial);
  const [badges, setBadges] = useState<{ matches?: string; chats?: string; views?: string }>({});

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.stats) setStats(data.stats);
    } catch (e) {
      // ignore
    }
  }

  // animate display numbers towards the latest stats
  useEffect(() => {
    let raf = 0;
    const duration = 400;
    const start = performance.now();
    const from = { ...display };
    const to = { ...stats };

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setDisplay({
        matches: Math.round(from.matches + (to.matches - from.matches) * t),
        chats: Math.round(from.chats + (to.chats - from.chats) * t),
        views: Math.round(from.views + (to.views - from.views) * t),
      });
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  useEffect(() => {
    fetchStats();
    const refreshHandler = () => fetchStats();
    const optimisticHandler = (e: Event) => {
      try {
        const detail = (e as CustomEvent)?.detail || {};
        if (detail.matches) {
          // increment display immediately and show badge
          setDisplay((d) => ({ ...d, matches: d.matches + Number(detail.matches) }));
          setBadges((b) => ({ ...b, matches: `+${detail.matches}` }));
          setTimeout(() => setBadges((b) => ({ ...b, matches: undefined })), 1400);
        }
      } catch (err) {
        // noop
      }
    };

    window.addEventListener('dashboard:stats:refresh', refreshHandler as EventListener);
    window.addEventListener('dashboard:stats:optimistic', optimisticHandler as EventListener);
    return () => {
      window.removeEventListener('dashboard:stats:refresh', refreshHandler as EventListener);
      window.removeEventListener('dashboard:stats:optimistic', optimisticHandler as EventListener);
    };
  }, []);

  return (
    <section className="flex flex-col md:flex-row gap-6 mb-10" aria-label="Summary statistics">
      <div className="flex-1 stat-card" role="region" aria-label="Total matches">
        <span className="text-2xl mb-2" aria-hidden>
          💜
        </span>
        <div className="flex items-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold gradient-clip">{display.matches}</span>
            {badges.matches && <span className="stat-badge">{badges.matches}</span>}
          </div>
          <span className="text-rose-500 font-semibold">+12 this week</span>
        </div>
        <span className="text-muted-500 mt-1">Total Matches</span>
      </div>
      <div className="flex-1 stat-card" role="region" aria-label="Active chats">
        <span className="text-2xl mb-2" aria-hidden>
          💬
        </span>
        <div className="flex items-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold gradient-clip">{display.chats}</span>
            {badges.chats && <span className="stat-badge">{badges.chats}</span>}
          </div>
          <span className="text-rose-300 font-semibold">+5 today</span>
        </div>
        <span className="text-muted-500 mt-1">Active Chats</span>
      </div>
      <div className="flex-1 stat-card" role="region" aria-label="Profile views">
        <span className="text-2xl mb-2" aria-hidden>
          ⭐
        </span>
        <div className="flex items-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold gradient-clip">{display.views}</span>
            {badges.views && <span className="stat-badge">{badges.views}</span>}
          </div>
          <span className="text-fuchsia-500 font-semibold">Top 10%</span>
        </div>
        <span className="text-muted-500 mt-1">Profile Views</span>
      </div>
    </section>
  );
}
