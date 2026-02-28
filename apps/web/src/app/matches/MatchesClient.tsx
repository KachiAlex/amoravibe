"use client";

import { useEffect, useMemo, useState } from 'react';
import type { MatchCandidate } from '@lovedate/api';
import { Badge, Card, PillButton } from '@lovedate/ui';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';

const MatchCardClient = nextDynamic(() => import('./MatchCardClient'), { ssr: false });

const INTERESTS = ['Travel', 'Coffee', 'Design', 'Hiking', 'Fitness', 'Food', 'Music', 'Books'];

interface Props {
  initialUserId: string | null;
}

export function MatchesClient({ initialUserId }: Props) {
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [matches, setMatches] = useState<MatchCandidate[] | null>(null);
  const [radiusKm, setRadiusKm] = useState(100);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // fallback to onboarding storage if no server userId
  useEffect(() => {
    if (userId) return;
    try {
      const stored = localStorage.getItem('lovedate_onboarding');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.userId) setUserId(parsed.userId as string);
      }
    } catch (e) {
      // ignore
    }
  }, [userId]);

  const filteredMatches = useMemo(() => matches ?? [], [matches]);

  const fetchMatches = useMemo(
    () =>
      async (uid: string) => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.set('userId', uid);
          params.set('radiusKm', String(radiusKm));
          params.set('limit', '12');
          if (verifiedOnly) params.set('verifiedOnly', '1');
          if (selectedInterests.length) params.set('interests', selectedInterests.join(','));
          const res = await fetch(`/api/matches?${params.toString()}`);
          if (!res.ok) throw new Error('Failed to fetch matches');
          const data = (await res.json()) as MatchCandidate[];
          setMatches(data);
        } catch (err) {
          console.error('Failed to load matches', err);
          setMatches(null);
        } finally {
          setLoading(false);
        }
      },
    [radiusKm, verifiedOnly, selectedInterests]
  );

  useEffect(() => {
    if (userId) {
      void fetchMatches(userId);
    }
  }, [userId, fetchMatches]);

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <Badge tone="primary" className="mx-auto w-fit bg-rose-500/10 text-rose-500">
            Discovery
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">Find your Lovedate orbit</h1>
          <p className="text-ink-700">
            You&apos;re not signed in yet. Complete onboarding so we can personalize your discovery
            queue automatically.
          </p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Finish onboarding first</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/dashboard">View trust dashboard</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-24 sm:px-12 lg:px-20">
        <p className="text-ink-700">Loading matches…</p>
      </main>
    );
  }

  if (!matches) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-3">
          <Badge tone="primary" className="mx-auto w-fit bg-amber-500/10 text-amber-600">
            Discovery paused
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">We couldn’t load matches</h1>
          <p className="text-ink-700">Give it another go in a moment or retry onboarding.</p>
          <div className="flex justify-center gap-3">
            <PillButton onClick={() => void fetchMatches(userId)}>Refresh matches</PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/dashboard">Trust dashboard</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[24px] border border-white/70 bg-white/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink-700">Welcome back, {userId || 'Friend'}! 👋</p>
            <h1 className="font-display text-4xl text-ink-900">You have 3 new matches and 2 new messages</h1>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-white shadow-sm border border-white/80 p-5">
              <div className="flex items-center justify-between text-sm text-ink-700">
                <span>Total Matches</span>
                <span className="text-green-600 font-semibold">+12 this week</span>
              </div>
              <p className="mt-2 text-4xl font-bold text-ink-900">{matches.length + 24}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-white/80 p-5">
              <div className="flex items-center justify-between text-sm text-ink-700">
                <span>Active Chats</span>
                <span className="text-green-600 font-semibold">+5 today</span>
              </div>
              <p className="mt-2 text-4xl font-bold text-ink-900">{matches.length}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-white/80 p-5">
              <div className="flex items-center justify-between text-sm text-ink-700">
                <span>Profile Views</span>
                <span className="text-purple-600 font-semibold">Top 10%</span>
              </div>
              <p className="mt-2 text-4xl font-bold text-ink-900">156</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">Your Matches</h2>
          <p className="text-sm text-ink-700">Curated members based on your preferences.</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm"
          >
            Filters
          </button>
          {showFilters && (
            <div className="absolute right-0 z-20 mt-3 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-semibold text-ink-800" htmlFor="radius">Max distance ({radiusKm} km)</label>
                  <input
                    id="radius"
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                  />
                  Verified only
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() =>
                          setSelectedInterests((prev) =>
                            prev.includes(interest)
                              ? prev.filter((i) => i !== interest)
                              : [...prev, interest]
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                          active
                            ? 'bg-fuchsia-600 text-white border-fuchsia-600'
                            : 'bg-white text-ink-800 border-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  <PillButton variant="outline" onClick={() => setShowFilters(false)}>Close</PillButton>
                  <PillButton
                    onClick={() => {
                      if (userId) void fetchMatches(userId);
                      setShowFilters(false);
                    }}
                  >
                    Apply
                  </PillButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredMatches.length === 0 ? (
          <Card className="col-span-full space-y-3 text-center">
            <h2 className="font-display text-2xl text-ink-900">No intros yet</h2>
            <p className="text-ink-700">Try expanding your distance or adjust your filters.</p>
            <PillButton onClick={() => void fetchMatches(userId)}>Refresh</PillButton>
          </Card>
        ) : (
          filteredMatches.map((match) => <MatchCardClient key={match.id} match={match} />)
        )}
      </section>
    </main>
  );
}
