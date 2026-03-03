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
  interests?: string[];
  matchPercent?: number;
  isNew?: boolean;
  accepted?: boolean;
};

const DEFAULT_MATCHES: Match[] = [
  {
    id: 'seed-sarah',
    name: 'Sarah Johnson',
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

  return (
    <section aria-labelledby="matches-heading" className="mt-6">
      {loading && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-gray-500 shadow">
          <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
          Updating your matches…
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((m) => (
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
                unoptimized
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
            <div className="flex items-center gap-3 border-t border-gray-100 bg-white/80 p-4">
              <button
                onClick={() => handleAccept(m.id)}
                disabled={acceptingIds.has(m.id) || m.accepted}
                className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-center text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {m.accepted ? 'Accepted' : acceptingIds.has(m.id) ? 'Sending…' : 'Like'}
              </button>
              <button
                onClick={() => setMatches((prev) => prev.filter((x) => x.id !== m.id))}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Pass
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

