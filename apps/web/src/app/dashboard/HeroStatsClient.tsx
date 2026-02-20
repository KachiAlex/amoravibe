"use client";

import React, { useEffect, useState } from 'react';

type Props = {
  userId?: string;
  initialMatches: number;
  initialChats: number;
  initialProfileViews: number;
};

export default function HeroStatsClient({
  userId,
  initialMatches,
  initialChats,
  initialProfileViews,
}: Props) {
  const [metrics, setMetrics] = useState({
    matches: initialMatches,
    activeChats: initialChats,
    profileViews: initialProfileViews,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchMetrics = async () => {
      try {
        // Prefer proxied backend endpoint for engagement dashboard
        const backendPath = userId
          ? `/api/trust/engagement/dashboard/${encodeURIComponent(userId)}`
          : '/api/dashboard/metrics';

        const res = await fetch(backendPath, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!mounted || !data) return;

        setMetrics({
          matches: typeof data.matches === 'number' ? data.matches : initialMatches,
          activeChats: typeof data.activeChats === 'number' ? data.activeChats : initialChats,
          profileViews:
            typeof data.profileViews === 'number' ? data.profileViews : initialProfileViews,
        });
      } catch (err) {
        // Fallback: keep initial values (already set) and silently ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, [initialMatches, initialChats, initialProfileViews, userId]);

  return (
    <div className="flex w-full sm:w-auto gap-3 sm:gap-4">
      <div className="flex-1 sm:flex-none stat-card w-full sm:w-40 transition-transform hover:scale-[1.01]">
        <p className="text-xs text-[#94a3b8]">Total Matches</p>
        <p className="mt-2 text-2xl lg:text-3xl font-bold text-[#0f172a]">
          {loading ? '—' : <span className="gradient-clip">{metrics.matches}</span>}
        </p>
        <p className="text-xs text-[#10b981]">+12 this week</p>
      </div>

      <div className="flex-1 sm:flex-none stat-card w-full sm:w-40 transition-transform hover:scale-[1.01]">
        <p className="text-xs text-[#94a3b8]">Active Chats</p>
        <p className="mt-2 text-2xl lg:text-3xl font-bold text-[#0f172a]">
          {loading ? '—' : <span className="gradient-clip">{metrics.activeChats}</span>}
        </p>
        <p className="text-xs text-[#10b981]">+5 today</p>
      </div>

      <div className="flex-1 sm:flex-none stat-card w-full sm:w-40 transition-transform hover:scale-[1.01]">
        <p className="text-xs text-[#94a3b8]">Profile Views</p>
        <p className="mt-2 text-2xl lg:text-3xl font-bold text-[#0f172a]">
          {loading ? '—' : <span className="gradient-clip">{metrics.profileViews}</span>}
        </p>
        <p className="text-xs text-[#8b5cf6]">Top 10%</p>
      </div>
    </div>
  );
}
