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

export default function Header({ userName = 'You' }: { userName?: string }) {
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

  return (
    <header className="flex items-center justify-between mb-8" role="banner">
      <div className="flex items-center gap-4">
        <Image
          src="/amoravibe.jpg"
          alt="AmoraVibe"
          width={50}
          height={50}
          className="rounded-full shadow-md"
          priority
        />
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{userName || 'Guest'}</span> <span aria-hidden>👋</span>
          </h1>
          <p className="text-gray-500 mt-1">Quick summary of your activity</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200" aria-label="Open menu">
          <span aria-hidden>☰</span>
        </button>
        <form onSubmit={handleSearchSubmit} role="search" className="relative">
          <input
            type="search"
            aria-label="Search profiles and interests"
            placeholder="Search profiles, interests..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-full px-4 py-2 border border-gray-200 bg-white shadow-sm w-64 pr-10"
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden>
            {searching ? '…' : '⌘K'}
          </span>
        </form>
        <button className="relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200" aria-label="Notifications" onClick={() => window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: { event: 'notifications_opened' } }))}>
          <span className="text-2xl" aria-hidden>
            🔔
          </span>
          <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full px-1">
            {notificationCount === null ? '…' : notificationCount}
          </span>
        </button>
        <button
          onClick={handleThemeToggle}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-purple-200"
          aria-label="Toggle theme"
        >
          <span aria-hidden>{isDark ? '🌙' : '☀️'}</span>
          <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
        </button>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm" aria-label="User menu">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-2 py-1 font-bold">
            {(userName || 'Guest').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </span>
          <span className="font-medium text-gray-900">{userName || 'Guest'}</span>
        </div>
      </div>
    </header>
  );
}
