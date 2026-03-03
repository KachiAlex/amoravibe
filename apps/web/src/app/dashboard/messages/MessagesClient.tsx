"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'unread'>('recent');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickReplyId, setQuickReplyId] = useState<string | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('');

  useEffect(() => {
    setReadMap(loadReadState());
    const t = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(t);
  }, []);

  const unreadCount = useMemo(() => messages.filter((m) => m.unread && !readMap[m.id]).length, [messages, readMap]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = messages.filter((m) => {
      // Filter by archive status
      if (filter === 'archived') {
        if (!archived[m.id]) return false;
      } else {
        if (archived[m.id]) return false;
      }
      
      const isUnread = m.unread && !readMap[m.id];
      if (filter === 'unread' && !isUnread) return false;
      if (!term) return true;
      const target = `${m.from ?? ''} ${m.preview ?? ''} ${m.text ?? ''}`.toLowerCase();
      return target.includes(term);
    });

    // Sort messages
    result.sort((a, b) => {
      // Pinned always first
      const aPinned = pinned[a.id] ? 1 : 0;
      const bPinned = pinned[b.id] ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      // Then apply selected sort
      if (sortBy === 'alphabetical') {
        return (a.from ?? '').localeCompare(b.from ?? '');
      } else if (sortBy === 'unread') {
        const aUnread = (a.unread && !readMap[a.id]) ? 1 : 0;
        const bUnread = (b.unread && !readMap[b.id]) ? 1 : 0;
        return bUnread - aUnread;
      }
      // Default: recent (maintain original order)
      return 0;
    });

    return result;
  }, [messages, filter, search, readMap, archived, pinned, sortBy]);

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

  const togglePin = (id: string) => {
    setPinned((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickReply = async (id: string) => {
    if (!quickReplyText.trim()) return;
    
    // TODO: Implement actual API call to send message
    console.log(`Sending quick reply to ${id}:`, quickReplyText);
    
    // Reset quick reply state
    setQuickReplyText('');
    setQuickReplyId(null);
    
    // Mark as read when replying
    handleOpen(id);
  };

  const archivedCount = useMemo(() => Object.values(archived).filter(Boolean).length, [archived]);

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
            <p className="text-sm text-ink-700">You have 3 new matches and {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</p>
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
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  filter === 'archived' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-fuchsia-700'
                }`}
              >
                Archived ({archivedCount})
              </button>
            </div>
          </div>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical' | 'unread')}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm hover:border-fuchsia-200 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">A-Z</option>
              <option value="unread">Unread First</option>
            </select>
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
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-purple-50 px-8 py-12 text-center shadow-sm">
            <div className="mb-4 text-6xl">
              {filter === 'archived' ? '📂' : search ? '🔍' : '💬'}
            </div>
            <h3 className="mb-2 text-2xl font-bold text-ink-900">
              {filter === 'archived' 
                ? 'No archived messages' 
                : search 
                ? `No results for "${search}"` 
                : filter === 'unread'
                ? 'All caught up! 🎉'
                : 'No messages yet'}
            </h3>
            <p className="mb-6 max-w-md mx-auto text-ink-700">
              {filter === 'archived'
                ? 'Messages you archive will appear here for easy access later.'
                : search
                ? 'Try adjusting your search terms or browse all messages.'
                : filter === 'unread'
                ? "You've read all your messages. Great job staying connected!"
                : 'Start conversations with your matches to see messages here.'}
            </p>
            {!search && filter !== 'archived' && filter !== 'unread' && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
                >
                  Browse Matches
                </a>
                <a
                  href="/dashboard/discover"
                  className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Discover People
                </a>
              </div>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 rounded-[18px] border border-white/70 bg-white/80 p-3 shadow-sm">
            {filtered.map((m) => {
              const isUnread = m.unread && !readMap[m.id];
              return (
                <React.Fragment key={m.id}>
                <Link
                  href={`/dashboard/messages/${m.id}`}
                  onClick={() => handleOpen(m.id)}
                  className={`group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:border-fuchsia-100 hover:shadow-md ${
                    isUnread ? 'ring-1 ring-fuchsia-100' : ''
                  } ${muted[m.id] ? 'opacity-70' : ''}`}
                >
                  <div className="relative">
                    <Image
                      src={m.avatar}
                      alt={`${m.from} avatar`}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover shadow-sm"
                    />
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
                    {pinned[m.id] && <span className="text-sm" title="Pinned">📌</span>}
                    {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />}
                    <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickReplyId(quickReplyId === m.id ? null : m.id);
                          setQuickReplyText('');
                        }}
                        title="Quick Reply"
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-ink-700 hover:border-fuchsia-200 hover:text-fuchsia-700"
                      >
                        💬 Reply
                      </button>
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
                          togglePin(m.id);
                        }}
                        title={pinned[m.id] ? 'Unpin' : 'Pin'}
                        className="rounded-full border border-gray-200 p-1.5 text-xs font-semibold text-ink-600 hover:border-fuchsia-200 hover:text-fuchsia-700"
                      >
                        {pinned[m.id] ? '📌' : '📍'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleMute(m.id);
                        }}
                        title={muted[m.id] ? 'Unmute' : 'Mute'}
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
                        title={archived[m.id] ? 'Unarchive' : 'Archive'}
                        className="rounded-full border border-gray-200 p-1.5 text-xs font-semibold text-ink-600 hover:border-fuchsia-200 hover:text-fuchsia-700"
                      >
                        {archived[m.id] ? '📂' : '🗂'}
                      </button>
                    </div>
                  </div>
                </Link>
                {quickReplyId === m.id && (
                  <div className="ml-16 mt-2 rounded-xl border border-fuchsia-200 bg-gradient-to-r from-purple-50 to-pink-50 p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={quickReplyText}
                        onChange={(e) => setQuickReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleQuickReply(m.id);
                          }
                          if (e.key === 'Escape') {
                            setQuickReplyId(null);
                            setQuickReplyText('');
                          }
                        }}
                        placeholder={`Reply to ${m.from}...`}
                        className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                        autoFocus
                      />
                      <button
                        onClick={() => handleQuickReply(m.id)}
                        disabled={!quickReplyText.trim()}
                        className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => {
                          setQuickReplyId(null);
                          setQuickReplyText('');
                        }}
                        className="rounded-full border border-gray-200 bg-white p-2 text-sm text-gray-600 hover:bg-gray-50"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {['❤️', '👍', '😊', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setQuickReplyText(emoji);
                            handleQuickReply(m.id);
                          }}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm transition hover:bg-gray-50"
                          title={`Send ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
