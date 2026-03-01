"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type Stats = { matches: number; chats: number; views: number };

function statsEqual(a: Stats, b: Stats) {
  return a.matches === b.matches && a.chats === b.chats && a.views === b.views;
}

export default function StatsCards({ stats: statsProp }: { stats?: Stats }) {
  const hasServerStats = Boolean(statsProp);
  const normalizedStats = useMemo<Stats>(
    () => ({
      matches: statsProp?.matches ?? 0,
      chats: statsProp?.chats ?? 0,
      views: statsProp?.views ?? 0,
    }),
    [statsProp?.matches, statsProp?.chats, statsProp?.views]
  );

  const [stats, setStats] = useState<Stats>(normalizedStats);
  const [display, setDisplay] = useState<Stats>(normalizedStats);
  const [badges, setBadges] = useState<{ matches?: string; chats?: string; views?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(() => !hasServerStats);
  const [refreshing, setRefreshing] = useState(false);

  const trackDashboardEvent = useCallback((event: string, detail?: Record<string, unknown>) => {
    try {
      window.dispatchEvent(new CustomEvent('dashboard:telemetry', { detail: { event, ...detail } }));
    } catch (_) {
      // noop for SSR/window-less environments
    }
  }, []);

  useEffect(() => {
    if (!hasServerStats) return;
    setLoading(false);
    setStats((prev) => (statsEqual(prev, normalizedStats) ? prev : normalizedStats));
  }, [normalizedStats, hasServerStats]);

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    setError(null);
    trackDashboardEvent('stats_refresh_requested', { manual });
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await res.json();
      if (data) {
        const next: Stats = {
          matches: data.matches,
          chats: data.chats,
          views: data.views,
        };
        setStats((prev) => (statsEqual(prev, next) ? prev : next));
        trackDashboardEvent('stats_refresh_succeeded', { manual });
      }
    } catch (e) {
      setError('Unable to refresh stats. Please try again.');
      trackDashboardEvent('stats_refresh_failed', { manual });
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, [trackDashboardEvent]);

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
    if (!hasServerStats) {
      fetchStats();
    }
  }, [hasServerStats, fetchStats]);

  useEffect(() => {
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
  }, [fetchStats]);

  const header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Activity snapshot</h2>
        {error && (
          <p className="text-sm text-red-500" role="status" aria-live="polite">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => fetchStats(true)}
        disabled={refreshing}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
      >
        {refreshing ? 'Refreshing…' : 'Refresh stats'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <section className="mb-12 animate-fade-in" aria-label="Summary statistics">
        {header}
        <div className="flex flex-col md:flex-row gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 stat-card rounded-2xl bg-white shadow p-6 animate-pulse border border-gray-100">
              <div className="w-10 h-10 bg-gray-100 rounded-full mb-2 animate-pulse" />
              <div className="h-8 w-24 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="mb-12 animate-fade-in" aria-label="Summary statistics">
      {header}
      <div className="flex flex-col md:flex-row gap-8">
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
      </div>
    </section>
  );
}
