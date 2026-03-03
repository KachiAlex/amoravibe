"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/app/providers/ThemeProvider';

const SEARCH_EVENT = 'dashboard:matches:search';
const TELEMETRY_EVENT = 'dashboard:telemetry';

async function fetchNotificationCount(): Promise<number> {
  try {
    const res = await fetch('/api/notifications/count', { cache: 'no-store' });
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    return data.count ?? 0;
  } catch (_) {
    return 0;
  }
}

async function persistTheme(theme: 'light' | 'dark') {
  try {
    await fetch('/api/user/preferences/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
  } catch (_) {
    // ignore preference failure silently for now
  }
}

type HeaderProps = {
  userName?: string;
  userFirstName?: string;
  userAvatar?: string | null;
  userOrientation?: string | null;
};

export default function Header({ userName, userFirstName, userAvatar, userOrientation }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchNotificationCount().then(setNotificationCount);
    const id = setInterval(() => {
      fetchNotificationCount().then(setNotificationCount);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const executeSearch = useMemo(
    () => async (nextQuery: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const trimmed = nextQuery.trim();
      if (!trimmed) {
        window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { query: '', results: [] } }));
        setSearching(false);
        return;
      }
      abortRef.current = new AbortController();
      setSearching(true);
      window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: { event: 'search_requested', query: trimmed } }));
      try {
        const res = await fetch(`/api/search/matches?q=${encodeURIComponent(trimmed)}`, {
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { query: trimmed, results: data.results ?? [] } }));
        window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: { event: 'search_succeeded', query: trimmed } }));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: { event: 'search_failed', query: trimmed } }));
        window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { query: trimmed, error: 'Unable to search right now.' } }));
      } finally {
        setSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      executeSearch(query);
    }, 400);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, executeSearch]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    executeSearch(query);
  };

  const handleThemeToggle = async () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    persistTheme(next);
    window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: { event: 'theme_toggled', theme: next } }));
  };

  const displayName = userFirstName || userName || 'Guest';
  const displayOrientation = userOrientation ? ` • ${userOrientation}` : '';

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8" role="banner">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{displayName}</span> <span aria-hidden>👋</span>
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Quick summary of your activity{displayOrientation}
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        <form onSubmit={handleSearchSubmit} role="search" className="relative flex-1 md:flex-initial">
          <input
            type="search"
            aria-label="Search profiles and interests"
            placeholder="Search..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-full px-4 py-2 border border-gray-200 bg-white shadow-sm w-full md:w-48 lg:w-64 pr-10 text-sm"
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm" aria-hidden>
            {searching ? '…' : '⌘K'}
          </span>
        </form>
        <button className="relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200" aria-label="Notifications" onClick={() => window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: { event: 'notifications_opened' } }))}>
          <span className="text-xl md:text-2xl" aria-hidden>
            🔔
          </span>
          <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full px-1 min-w-[16px] text-center">
            {notificationCount === null ? '…' : notificationCount}
          </span>
        </button>
        <button
          onClick={handleThemeToggle}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs md:text-sm font-semibold shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-purple-200"
          aria-label="Toggle theme"
        >
          <span aria-hidden>{isDark ? '🌙' : '☀️'}</span>
          <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm" aria-label="User menu">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={displayName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-2 py-1 font-bold text-xs">
              {(userName || 'Guest').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          )}
          <span className="font-medium text-gray-900 text-sm">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
