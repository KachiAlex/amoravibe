"use client";
import React, { useEffect, useState } from 'react';

type Stats = { matches: number; chats: number; views: number };

export default function StatsCards({ stats: initial = { matches: 0, chats: 0, views: 0 } }: { stats?: Stats }) {
  const [stats, setStats] = useState<Stats>(initial);
  const [display, setDisplay] = useState<Stats>(initial);
  const [badges, setBadges] = useState<{ matches?: string; chats?: string; views?: string }>({});

  const [loading, setLoading] = useState(true);
  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json();
      if (data) setStats({
        matches: data.matches,
        chats: data.chats,
        views: data.views
      });
    } catch (e) {
      // ignore
    }
    setLoading(false);
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

  if (loading) {
    return (
      <section className="flex flex-col md:flex-row gap-8 mb-12 animate-fade-in" aria-label="Summary statistics">
        {[1,2,3].map((i) => (
          <div key={i} className="flex-1 stat-card rounded-2xl bg-white shadow p-6 animate-pulse border border-gray-100">
            <div className="w-10 h-10 bg-gray-100 rounded-full mb-2 animate-pulse" />
            <div className="h-8 w-24 bg-gray-100 rounded mb-2 animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </section>
    );
  }
  return (
    <section className="flex flex-col md:flex-row gap-8 mb-12 animate-fade-in" aria-label="Summary statistics">
      <div className="flex-1 stat-card rounded-2xl bg-white shadow p-6 border border-gray-100" role="region" aria-label="Total matches" tabIndex={0}>
        <span className="text-2xl mb-2" aria-hidden>
          💜
        </span>
        <div className="flex items-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{display.matches}</span>
            {badges.matches && <span className="stat-badge bg-fuchsia-100 border border-fuchsia-300 text-fuchsia-700 shadow">{badges.matches}</span>}
          </div>
          <span className="text-green-600 font-semibold">+12 this week</span>
        </div>
        <span className="text-gray-700 mt-1 font-medium">Total Matches</span>
      </div>
      <div className="flex-1 stat-card rounded-2xl bg-white shadow p-6 border border-gray-100" role="region" aria-label="Active chats" tabIndex={0}>
        <span className="text-2xl mb-2" aria-hidden>
          💬
        </span>
        <div className="flex items-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{display.chats}</span>
            {badges.chats && <span className="stat-badge bg-fuchsia-100 border border-fuchsia-300 text-fuchsia-700 shadow">{badges.chats}</span>}
          </div>
          <span className="text-green-600 font-semibold">+5 today</span>
        </div>
        <span className="text-gray-700 mt-1 font-medium">Active Chats</span>
      </div>
      <div className="flex-1 stat-card rounded-2xl bg-white shadow p-6 border border-gray-100" role="region" aria-label="Profile views" tabIndex={0}>
        <span className="text-2xl mb-2" aria-hidden>
          ⭐
        </span>
        <div className="flex items-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{display.views}</span>
            {badges.views && <span className="stat-badge bg-fuchsia-100 border border-fuchsia-300 text-fuchsia-700 shadow">{badges.views}</span>}
          </div>
          <span className="text-purple-600 font-semibold">Top 10%</span>
        </div>
        <span className="text-gray-700 mt-1 font-medium">Profile Views</span>
      </div>
    </section>
  );
}
