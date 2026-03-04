"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

type Match = {
  id: string;
  name: string;
  age?: number;
  jobTitle?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  tagline?: string;
  interests?: string[];
  matchPercent?: number;
  isNew?: boolean;
  accepted?: boolean;
  gender?: string;
};

const DEFAULT_MATCHES: Match[] = [
  {
    id: 'seed-sarah',
    name: 'Sarah Johnson',
    gender: 'female',
    age: 28,
    jobTitle: 'UX Designer',
    location: 'San Francisco, CA',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Designing delightful experiences, coffee snob, sunset chaser.',
    interests: ['Travel', 'Design', 'Coffee'],
    matchPercent: 95,
    isNew: true,
  },
  {
    id: 'seed-michael',
    name: 'Michael Chen',
    gender: 'male',
    age: 31,
    jobTitle: 'Software Engineer',
    location: 'Los Angeles, CA',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Full-stack maker who spends weekends hiking and discovering food trucks.',
    interests: ['Hiking', 'Foodie', 'Photography'],
    matchPercent: 92,
    isNew: true,
  },
  {
    id: 'seed-emma',
    name: 'Emma Rodriguez',
    gender: 'female',
    age: 29,
    jobTitle: 'Marketing Lead',
    location: 'New York, NY',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Fitness devotee, brunch curator, always planning the next getaway.',
    interests: ['Brunch', 'Fitness', 'Travel'],
    matchPercent: 90,
  },
  {
    id: 'seed-james',
    name: 'James Wilson',
    gender: 'male',
    age: 33,
    jobTitle: 'Photographer',
    location: 'Chicago, IL',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    bio: 'Capturing candid moments and scouting new rooftop spots.',
    interests: ['Photography', 'Live Music'],
    matchPercent: 88,
  },
  {
    id: 'seed-aisha',
    name: 'Aisha Bello',
    gender: 'female',
    age: 30,
    jobTitle: 'Product Manager',
    location: 'Austin, TX',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    bio: 'Book club organizer bringing storytelling into every conversation.',
    interests: ['Books', 'Podcasts', 'Latte Art'],
    matchPercent: 87,
  },
  {
    id: 'seed-luca',
    name: 'Luca Romano',
    gender: 'male',
    age: 34,
    jobTitle: 'Architect',
    location: 'Seattle, WA',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    bio: 'Modern architecture nerd, vinyl collector, amateur chef.',
    interests: ['Architecture', 'Vinyl', 'Cooking'],
    matchPercent: 86,
  },
];

export default function MatchesListClient({ initialMatches = [] }: { initialMatches?: Match[] }) {
  const hydratedInitialMatches = useMemo(() => {
    return initialMatches && initialMatches.length > 0
      ? initialMatches.map((match) => ({
          ...match,
          jobTitle: match.jobTitle ?? (match as any)?.role,
          bio: match.bio ?? match.tagline,
          interests: Array.isArray((match as any)?.tags) ? (match as any).tags : match.interests,
        }))
      : [];
  }, [initialMatches]);

  const [matches, setMatches] = useState<Match[]>(
    hydratedInitialMatches.length > 0 ? hydratedInitialMatches : DEFAULT_MATCHES
  );
  const [loading, setLoading] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'match' | 'newest' | 'name'>('match');
  const [filterInterest, setFilterInterest] = useState<string>('');

  const filteredAndSortedMatches = useMemo(() => {
    let result = [...matches];

    // Filter by interest
    if (filterInterest) {
      result = result.filter((m) =>
        m.interests?.some((i) => i.toLowerCase().includes(filterInterest.toLowerCase()))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.matchPercent ?? 0) - (a.matchPercent ?? 0);
      } else if (sortBy === 'newest') {
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [matches, sortBy, filterInterest]);

  useEffect(() => {
    if (hydratedInitialMatches.length > 0) {
      setMatches(hydratedInitialMatches);
    } else {
      fetchMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydratedInitialMatches.length]);

  async function fetchMatches() {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/matches`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
      } else {
        setMatches(DEFAULT_MATCHES);
      }
    } catch {
      setMatches(DEFAULT_MATCHES);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    setAcceptingIds((s) => new Set(s).add(id));
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, accepted: true } : m)));
    try {
      window.dispatchEvent(new CustomEvent('dashboard:stats:optimistic', { detail: { matches: 1 } }));
    } catch {
      // ignore outside browser
    }
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/matches/${id}/like`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('post failed');
      await fetchMatches();
      try {
        window.dispatchEvent(new CustomEvent('dashboard:stats:refresh'));
      } catch {
        // noop
      }
    } catch {
      setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, accepted: false } : m)));
    } finally {
      setAcceptingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  const SkeletonCard = () => (
    <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-lg">
      <div className="h-64 w-full animate-pulse bg-gradient-to-r from-gray-200 to-gray-300" />
      <div className="flex flex-col gap-3 p-6">
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white/50 px-8 py-16 text-center">
      <div className="mb-4 text-6xl">💜</div>
      <h3 className="mb-2 text-2xl font-bold text-gray-900">No matches found</h3>
      <p className="mb-6 max-w-md text-gray-600">
        {filterInterest
          ? `No matches found with interest "${filterInterest}". Try adjusting your filters.`
          : "We're still finding your perfect matches. Complete your profile or adjust your preferences to see more connections."}
      </p>
      <div className="flex gap-3">
        <a
          href="/dashboard/profile"
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
        >
          Complete Profile
        </a>
        <a
          href="/dashboard/discover"
          className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Discover More
        </a>
      </div>
    </div>
  );

  return (
    <section aria-labelledby="matches-heading" className="mt-6">
      {loading && !matches.length && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-gray-500 shadow">
          <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
          Loading your matches…
        </div>
      )}
      
      {/* Filter and Sort Controls */}
      {matches.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'match' | 'newest' | 'name')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="match">Match %</option>
            <option value="newest">Newest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="interest-filter" className="text-sm font-medium text-gray-700">
            Filter by interest:
          </label>
          <input
            id="interest-filter"
            type="text"
            placeholder="e.g., Travel, Coffee..."
            value={filterInterest}
            onChange={(e) => setFilterInterest(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          {filterInterest && (
            <button
              onClick={() => setFilterInterest('')}
              className="text-sm text-gray-500 hover:text-gray-700"
              aria-label="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="ml-auto text-sm text-gray-600">
          {filteredAndSortedMatches.length} {filteredAndSortedMatches.length === 1 ? 'match' : 'matches'}
        </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading && !matches.length ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredAndSortedMatches.length === 0 ? (
          <EmptyState />
        ) : (
          filteredAndSortedMatches.map((m) => (
          <div
            key={m.id}
            className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative">
              <Image
                src={m.avatar || '/images/default-avatar.png'}
                alt={`${m.name} avatar`}
                width={640}
                height={380}
                className="h-64 w-full object-cover"
                priority={filteredAndSortedMatches.indexOf(m) < 3}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              {typeof m.matchPercent === 'number' && (
                <span className="absolute left-4 top-4 rounded-full bg-purple-600/90 px-4 py-1 text-sm font-semibold text-white shadow">
                  {m.matchPercent}% Match
                </span>
              )}
              {m.isNew && (
                <span className="absolute right-4 top-4 rounded-full bg-pink-500/90 px-4 py-1 text-sm font-semibold text-white shadow">
                  New Match
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 p-6">
              <div>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {m.name}
                  {m.age ? <span className="text-gray-500">, {m.age}</span> : null}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {m.jobTitle ? `💼 ${m.jobTitle}` : ''}
                  {m.jobTitle && m.location ? <span className="mx-2 text-gray-300">•</span> : null}
                  {m.location ? `📍 ${m.location}` : ''}
                </p>
              </div>
              {m.bio && <p className="text-base text-gray-700">{m.bio}</p>}
              {Array.isArray(m.interests) && m.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {m.interests.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-3 py-1 text-xs font-semibold text-pink-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 bg-white/80">
              <div className="flex items-center gap-2 p-3">
                <button
                  onClick={() => handleAccept(m.id)}
                  disabled={acceptingIds.has(m.id) || m.accepted}
                  className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {m.accepted ? '✓ Liked' : acceptingIds.has(m.id) ? 'Sending…' : '💜 Like'}
                </button>
                <button
                  onClick={() => setMatches((prev) => prev.filter((x) => x.id !== m.id))}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  title="Pass on this match"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2 border-t border-gray-100 px-3 py-2">
                <button
                  onClick={() => {
                    // TODO: Implement view profile modal
                    alert(`View ${m.name}'s full profile`);
                  }}
                  className="flex-1 text-center text-xs font-medium text-purple-600 transition hover:text-purple-700"
                >
                  👁️ View Profile
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement send message
                    window.location.href = `/dashboard/messages?to=${m.id}`;
                  }}
                  className="flex-1 text-center text-xs font-medium text-purple-600 transition hover:text-purple-700"
                >
                  💬 Send Message
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </section>
  );
}

