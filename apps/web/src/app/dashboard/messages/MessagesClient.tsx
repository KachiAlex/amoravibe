"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Message } from '@/lib/dev-data';

type MessageWithUnread = Message & { unread?: boolean };

function loadReadState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('lovedate_read_messages');
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch (e) {
    return {};
  }
}

function saveReadState(map: Record<string, boolean>) {
  try {
    localStorage.setItem('lovedate_read_messages', JSON.stringify(map));
  } catch (e) {
    // ignore
  }
}

export function MessagesClient({
  initialMessages,
  userName,
}: {
  initialMessages: MessageWithUnread[];
  userName: string;
}) {
  const [messages] = useState<MessageWithUnread[]>(initialMessages);
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [archived, setArchived] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReadMap(loadReadState());
    const t = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(t);
  }, []);

  const unreadCount = useMemo(() => messages.filter((m) => m.unread && !readMap[m.id]).length, [messages, readMap]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (archived[m.id]) return false;
      const isUnread = m.unread && !readMap[m.id];
      if (filter === 'unread' && !isUnread) return false;
      if (!term) return true;
      const target = `${m.from ?? ''} ${m.preview ?? ''} ${m.text ?? ''}`.toLowerCase();
      return target.includes(term);
    });
  }, [messages, filter, search, readMap, archived]);

  const handleOpen = (id: string) => {
    setReadMap((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      saveReadState(next);
      return next;
    });
  };

  const handleMarkAllRead = () => {
    const allIds = Object.fromEntries(messages.map((m) => [m.id, true]));
    setReadMap(allIds);
    saveReadState(allIds);
  };

  const handleMarkAllUnread = () => {
    setReadMap({});
    saveReadState({});
  };

  const toggleMute = (id: string) => {
    setMuted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleArchive = (id: string) => {
    setArchived((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm animate-pulse">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-64 rounded bg-gray-100" />
          </div>
          <div className="h-3 w-10 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
      <div className="flex flex-col gap-4 rounded-[18px] border border-white/50 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm sm:max-w-xl">
          <span className="text-lg">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search profiles, interests..."
            className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-gray-200 bg-white px-3 py-2 text-ink-700 shadow-sm">🔔</button>
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-white shadow-md">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">JD</span>
            <span className="text-sm font-semibold">{userName || 'John Doe'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-white/60 bg-gradient-to-r from-pink-50 via-white to-purple-50 shadow-[0_20px_70px_rgba(110,55,255,0.1)]">
        <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-ink-700">Welcome back, <span className="text-fuchsia-700">{userName || 'John'}</span>! 👋</p>
            <p className="text-sm text-ink-700">You have 3 new matches and 2 new messages</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white px-5 py-5 shadow-sm">
              <div className="flex items-center justify-between text-sm text-ink-700">
                <span className="flex items-center gap-2 font-semibold text-ink-900">💜 Total Matches</span>
                <span className="text-green-600 font-semibold">+12 this week</span>
              </div>
              <p className="mt-2 text-4xl font-bold text-ink-900">{messages.length + 24}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white px-5 py-5 shadow-sm">
              <div className="flex items-center justify-between text-sm text-ink-700">
                <span className="flex items-center gap-2 font-semibold text-ink-900">💬 Active Chats</span>
                <span className="text-green-600 font-semibold">+5 today</span>
              </div>
              <p className="mt-2 text-4xl font-bold text-ink-900">{messages.length}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white px-5 py-5 shadow-sm">
              <div className="flex items-center justify-between text-sm text-ink-700">
                <span className="flex items-center gap-2 font-semibold text-ink-900">✨ Profile Views</span>
                <span className="text-purple-600 font-semibold">Top 10%</span>
              </div>
              <p className="mt-2 text-4xl font-bold text-ink-900">156</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-ink-900">Messages</h2>
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  filter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-fuchsia-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  filter === 'unread' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-fuchsia-700'
                }`}
              >
                Unread ({messages.filter((m) => m.unread && !readMap[m.id]).length})
              </button>
            </div>
          </div>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={handleMarkAllRead}
              className="w-full sm:w-auto rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm hover:border-fuchsia-200 hover:text-fuchsia-700"
            >
              Mark all as read
            </button>
            <button
              onClick={handleMarkAllUnread}
              className="w-full sm:w-auto rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm hover:border-fuchsia-200 hover:text-fuchsia-700"
            >
              Mark all unread
            </button>
          </div>
        </div>

        {loading ? (
          renderSkeleton()
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-ink-700 shadow-sm">
            <p className="text-lg font-semibold text-ink-900">No messages to show</p>
            <p className="mt-1 text-sm">Try adjusting filters or start a chat from your matches.</p>
          </div>
        ) : (
          <div className="space-y-3 rounded-[18px] border border-white/70 bg-white/80 p-3 shadow-sm">
            {filtered.map((m) => {
              const isUnread = m.unread && !readMap[m.id];
              return (
                <Link
                  key={m.id}
                  href={`/dashboard/messages/${m.id}`}
                  onClick={() => handleOpen(m.id)}
                  className={`group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:border-fuchsia-100 hover:shadow-md ${
                    isUnread ? 'ring-1 ring-fuchsia-100' : ''
                  } ${muted[m.id] ? 'opacity-70' : ''}`}
                >
                  <div className="relative">
                    <img src={m.avatar} alt={`${m.from} avatar`} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                    {(m.online || isUnread) && (
                      <span
                        className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full ring-2 ring-white ${
                          isUnread ? 'bg-fuchsia-500' : m.online ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-base font-semibold text-ink-900">{m.from}</p>
                        {m.online && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">online</span>}
                      </div>
                      <span className="text-xs text-ink-600 whitespace-nowrap">{m.time ?? ''}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-ink-700">
                      {m.typing && !readMap[m.id] ? (
                        <span className="flex items-center gap-1 text-fuchsia-700">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
                          typing…
                        </span>
                      ) : (
                        <p className="line-clamp-2 text-ink-700">{m.preview ?? ''}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />}
                    <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpen(m.id);
                          }}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-ink-700 hover:border-fuchsia-200 hover:text-fuchsia-700"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleMute(m.id);
                        }}
                        title="Mute"
                        className="rounded-full border border-gray-200 p-1.5 text-xs font-semibold text-ink-600 hover:border-fuchsia-200 hover:text-fuchsia-700"
                      >
                        {muted[m.id] ? '🔔' : '🔕'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleArchive(m.id);
                        }}
                        title="Archive"
                        className="rounded-full border border-gray-200 p-1.5 text-xs font-semibold text-ink-600 hover:border-fuchsia-200 hover:text-fuchsia-700"
                      >
                        {archived[m.id] ? '📂' : '🗂'}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
