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
  const [viewMode, setViewMode] = useState<'grid' | 'swipe'>('grid');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set());
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<Set<string>>(new Set());

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

  const handleLike = (profileId: string) => {
    setLikedProfiles((prev) => new Set(prev).add(profileId));
    setCurrentCardIndex((prev) => prev + 1);
    // TODO: Send like to API
    console.log('Liked profile:', profileId);
  };

  const handlePass = (profileId: string) => {
    setPassedProfiles((prev) => new Set(prev).add(profileId));
    setCurrentCardIndex((prev) => prev + 1);
    console.log('Passed profile:', profileId);
  };

  const handleSuperLike = (profileId: string) => {
    setLikedProfiles((prev) => new Set(prev).add(profileId));
    setCurrentCardIndex((prev) => prev + 1);
    // TODO: Send super like to API
    console.log('Super liked profile:', profileId);
  };

  const handleBookmark = (profileId: string) => {
    setBookmarkedProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      const prevProfile = filtered?.[currentCardIndex - 1];
      if (prevProfile) {
        setLikedProfiles((prev) => {
          const next = new Set(prev);
          next.delete(prevProfile.id);
          return next;
        });
        setPassedProfiles((prev) => {
          const next = new Set(prev);
          next.delete(prevProfile.id);
          return next;
        });
      }
    }
  };

  const renderCard = (m: MatchCandidate) => (
    <div
      key={m.id}
      className="group rounded-2xl border border-white/80 bg-white/90 shadow-sm hover:shadow-xl transition-all p-4 flex flex-col gap-3"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
        {m.photos?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={m.photos[0]} 
            alt={m.displayName} 
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => handleBookmark(m.id)}
            className="rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-110"
          >
            {bookmarkedProfiles.has(m.id) ? '🔖' : '📌'}
          </button>
        </div>
        {typeof m.compatibilityScore === 'number' && (
          <div className="absolute bottom-2 left-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
            {m.compatibilityScore}% Match
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-lg font-semibold text-ink-900">{m.displayName}</p>
          {m.city && <p className="text-sm text-ink-600">📍 {m.city}</p>}
        </div>
      </div>
      {m.bio && (
        <p className="text-sm text-ink-700 line-clamp-2">{m.bio}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-ink-700">
        {(m.tags || []).slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full bg-gradient-to-r from-fuchsia-50 to-purple-50 px-3 py-1 border border-fuchsia-100 font-semibold text-fuchsia-700">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleLike(m.id)}
          disabled={likedProfiles.has(m.id)}
          className="flex-1 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-fuchsia-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {likedProfiles.has(m.id) ? '✓ Liked' : '💜 Like'}
        </button>
        <PillButton variant="outline" className="flex-1" asChild>
          <Link href={`/matches?userId=${encodeURIComponent(userId ?? '')}`}>View</Link>
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

      <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Discovery Settings</h3>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-fuchsia-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📱 Grid
            </button>
            <button
              onClick={() => setViewMode('swipe')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'swipe'
                  ? 'bg-white text-fuchsia-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💫 Swipe
            </button>
          </div>
        </div>
        
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
                className="accent-fuchsia-600"
              />
              <span className="text-sm font-semibold text-ink-900">{radiusKm} km</span>
            </div>
          </div>
          <div className="rounded-full bg-white border border-gray-200 px-4 py-2 shadow-sm">
            <label className="text-xs font-semibold text-ink-700">Age range</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={18}
                max={80}
                step={1}
                value={ageRange[0]}
                onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                className="accent-fuchsia-600"
              />
              <span className="text-sm font-semibold text-ink-900">{ageRange[0]}</span>
              <span className="text-xs text-ink-600">to</span>
              <input
                type="range"
                min={18}
                max={80}
                step={1}
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                className="accent-fuchsia-600"
              />
              <span className="text-sm font-semibold text-ink-900">{ageRange[1]}</span>
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
        viewMode === 'swipe' ? (
          <div className="relative mx-auto max-w-md">
            {currentCardIndex < filtered.length ? (
              <>
                <div className="relative h-[600px]">
                  {filtered.slice(currentCardIndex, currentCardIndex + 3).map((profile, idx) => {
                    const zIndex = 3 - idx;
                    const scale = 1 - idx * 0.05;
                    const translateY = idx * 10;
                    
                    return (
                      <div
                        key={profile.id}
                        className="absolute inset-0 transition-all duration-300"
                        style={{
                          zIndex,
                          transform: `scale(${scale}) translateY(${translateY}px)`,
                        }}
                      >
                        <div className="h-full rounded-3xl border-2 border-white/80 bg-white shadow-2xl overflow-hidden">
                          <div className="relative h-[400px]">
                            {profile.photos?.[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={profile.photos[0]}
                                alt={profile.displayName}
                                className="h-full w-full object-cover"
                                loading="eager"
                              />
                            )}
                            <div className="absolute top-4 right-4">
                              <button
                                onClick={() => handleBookmark(profile.id)}
                                className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white"
                              >
                                {bookmarkedProfiles.has(profile.id) ? '🔖' : '📌'}
                              </button>
                            </div>
                            {typeof profile.compatibilityScore === 'number' && (
                              <div className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                {profile.compatibilityScore}% Match
                              </div>
                            )}
                          </div>
                          <div className="p-6 space-y-3">
                            <div>
                              <h3 className="text-2xl font-bold text-ink-900">{profile.displayName}</h3>
                              {profile.city && <p className="text-sm text-ink-600">📍 {profile.city}</p>}
                            </div>
                            {profile.bio && (
                              <p className="text-sm text-ink-700 line-clamp-3">{profile.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {(profile.tags || []).slice(0, 5).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-gradient-to-r from-fuchsia-50 to-purple-50 px-3 py-1 text-xs font-semibold text-fuchsia-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => handlePass(filtered[currentCardIndex].id)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-2xl shadow-lg transition hover:scale-110 hover:border-gray-400"
                    title="Pass"
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleUndo}
                    disabled={currentCardIndex === 0}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-xl shadow-md transition hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    ↶
                  </button>
                  <button
                    onClick={() => handleSuperLike(filtered[currentCardIndex].id)}
                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-600 text-2xl text-white shadow-lg transition hover:scale-110"
                    title="Super Like"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleLike(filtered[currentCardIndex].id)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fuchsia-400 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-2xl text-white shadow-lg transition hover:scale-110"
                    title="Like"
                  >
                    💜
                  </button>
                </div>
                
                <div className="mt-4 text-center text-sm text-ink-600">
                  {currentCardIndex + 1} / {filtered.length}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-purple-50 px-8 py-12 text-center shadow-sm">
                <div className="mb-4 text-6xl">🎉</div>
                <h3 className="mb-2 text-2xl font-bold text-ink-900">You've seen everyone!</h3>
                <p className="mb-6 max-w-md mx-auto text-ink-700">
                  Check back later for new profiles or adjust your filters to see more people.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setCurrentCardIndex(0);
                      void fetchMatches();
                    }}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
                  >
                    Refresh Profiles
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Switch to Grid View
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(renderCard)}
          </div>
        )
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
