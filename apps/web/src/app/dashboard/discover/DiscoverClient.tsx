"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { MatchCandidate } from '@lovedate/api';
import { Badge, PillButton } from '@lovedate/ui';

const INTERESTS = ['Travel', 'Coffee', 'Design', 'Books', 'Hiking', 'Fitness', 'Food', 'Music'];

export function DiscoverClient({ userId, orientation }: { userId: string | null; orientation?: string | null }) {
  const [radiusKm, setRadiusKm] = useState(100);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [matches, setMatches] = useState<MatchCandidate[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    if (!userId) {
      setMatches(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('userId', userId);
      params.set('radiusKm', String(radiusKm));
      params.set('limit', '9');
      if (verifiedOnly) params.set('verifiedOnly', '1');
      const res = await fetch(`/api/matches?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = (await res.json()) as MatchCandidate[];
      setMatches(data);
    } catch (e) {
      setMatches(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm, verifiedOnly]);

  const filtered = useMemo(() => {
    if (!matches) return null;
    if (!selectedInterests.length) return matches;
    return matches.filter((m) => {
      const tags = (m.tags || []).map((t) => t.toLowerCase());
      return selectedInterests.some((i) => tags.includes(i.toLowerCase()));
    });
  }, [matches, selectedInterests]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const renderCard = (m: MatchCandidate) => (
    <div
      key={m.id}
      className="rounded-2xl border border-white/80 bg-white/90 shadow-sm hover:shadow-md transition p-4 flex flex-col gap-3"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
        {m.photos?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.photos[0]} alt={m.displayName} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-ink-900">{m.displayName}</p>
          {m.city && <p className="text-sm text-ink-600">{m.city}</p>}
        </div>
        {typeof m.compatibilityScore === 'number' && (
          <Badge tone="primary" className="bg-fuchsia-50 text-fuchsia-700">
            {m.compatibilityScore}% match
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-ink-700">
        {(m.tags || []).slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full bg-white px-3 py-1 border border-gray-200">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <PillButton asChild className="flex-1">
          <Link href={`/matches?userId=${encodeURIComponent(userId ?? '')}`}>View profile</Link>
        </PillButton>
        <PillButton variant="outline" className="flex-1" asChild>
          <Link href="/dashboard/messages">Say hi</Link>
        </PillButton>
      </div>
    </div>
  );

  return (
    <section className="mt-10 space-y-8">
      <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900">Boost your discovery</h3>
            <p className="text-sm text-ink-700">Verified profiles surface faster and get more introductions.</p>
          </div>
          <div className="flex gap-3">
            <PillButton asChild>
              <Link href="/dashboard/settings">Enable verification</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/dashboard">View trust score</Link>
            </PillButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-white border border-gray-200 px-4 py-2 shadow-sm">
            <label className="text-xs font-semibold text-ink-700">Max distance</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
              />
              <span className="text-sm font-semibold text-ink-900">{radiusKm} km</span>
            </div>
          </div>
          <div className="rounded-full bg-white border border-gray-200 px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-700">Orientation</span>
            <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
              {orientation || 'Set in profile'}
            </span>
          </div>
          <label className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 shadow-sm text-sm text-ink-800">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            Verified only
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  active
                    ? 'bg-fuchsia-600 text-white border-fuchsia-600'
                    : 'bg-white text-ink-700 border-gray-200 hover:border-fuchsia-200'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-ink-900">Suggested for you</h3>
          <p className="text-sm text-ink-700">Based on your lane, distance, and shared interests.</p>
        </div>
        <button
          onClick={() => void fetchMatches()}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm hover:border-fuchsia-200 hover:text-fuchsia-700"
        >
          Refresh batch
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm animate-pulse space-y-3">
              <div className="h-40 w-full rounded-xl bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : !userId ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/90 px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-ink-900">Finish onboarding to start discovering</p>
          <p className="mt-1 text-sm text-ink-700">We need your profile set up to personalize suggestions.</p>
          <div className="mt-3 flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Complete onboarding</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/dashboard/settings">Update preferences</Link>
            </PillButton>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-4 py-2 text-xs font-semibold text-fuchsia-700">
            Tip: Set your orientation and interests to unlock curated matches.
          </div>
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(renderCard)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/90 px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-ink-900">No suggestions match these filters</p>
          <p className="mt-1 text-sm text-ink-700">Try widening your distance or adjusting interests.</p>
          <div className="mt-3 flex justify-center gap-3">
            <PillButton onClick={() => setSelectedInterests([])}>Clear interests</PillButton>
            <PillButton variant="outline" onClick={() => setRadiusKm(150)}>
              Set distance to 150 km
            </PillButton>
          </div>
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-fuchsia-50 to-purple-50 px-4 py-3 text-sm text-ink-800 inline-flex items-center gap-2">
            <span className="text-fuchsia-600 font-semibold">Tip:</span> Verified profiles surface faster. Enable verification in settings.
          </div>
        </div>
      )}
    </section>
  );
}
