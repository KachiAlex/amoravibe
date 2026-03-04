import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from '@/lib/motion-shim';
import { trackEvent } from "@/lib/analytics";
import type { SwipeFilters } from "./DiscoverPanel";

type HistoryEntry = { profile: any; action: 'like' | 'pass' };
type QueueItem = { id: string; action: 'like' | 'pass'; attempt: number; nextAttemptAt: number };

const MAX_ATTEMPTS = 3;

type DiscoverSwipePanelProps = {
  onBack?: () => void;
  filters: SwipeFilters;
};

export default function DiscoverSwipePanel({ onBack, filters }: DiscoverSwipePanelProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [pendingQueue, setPendingQueue] = useState<QueueItem[]>([]);
  const hasLoadedRef = useRef(false);
  const processingRef = useRef(false);
  const filtersKey = JSON.stringify(filters);

  const fetchProfiles = useCallback(
    async ({ cursor = null, replace = false }: { cursor?: string | null; replace?: boolean } = {}) => {
      const isInitial = !hasLoadedRef.current || replace;
      isInitial ? setLoadingInitial(true) : setLoadingMore(true);
      try {
        const params = new URLSearchParams({ limit: '12' });
        if (cursor) params.set('cursor', cursor);
        params.set('radiusKm', String(filters.radiusKm));
        params.set('ageMin', String(filters.ageRange[0]));
        params.set('ageMax', String(filters.ageRange[1]));
        if (filters.interests.length) params.set('interests', filters.interests.join(','));
        if (filters.verifiedOnly) params.set('verifiedOnly', '1');
        const res = await fetch(`/api/discover/profiles?${params.toString()}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load profiles');
        const data = await res.json();
        setProfiles((prev) => (replace ? data.profiles : [...prev, ...data.profiles]));
        setNextCursor(data.nextCursor ?? null);
        if (replace) {
          setHistory([]);
        }
        hasLoadedRef.current = true;
        setError(null);
        if (data.profiles.length === 0 && !cursor) {
          setError('No profiles available right now. Try adjusting your preferences.');
        }
      } catch (e) {
        console.error(e);
        setError('Unable to load profiles. Please try again.');
      } finally {
        isInitial ? setLoadingInitial(false) : setLoadingMore(false);
      }
    },
    [filtersKey],
  );

  useEffect(() => {
    fetchProfiles({ replace: true });
  }, [fetchProfiles]);

  const remaining = profiles.length;
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (!nextCursor || remaining > 3) return;
    if (loadingInitial || loadingMore) return;
    fetchProfiles({ cursor: nextCursor });
  }, [remaining, nextCursor, loadingInitial, loadingMore, fetchProfiles]);

  const currentProfile = profiles[0];

  const enqueueAction = useCallback((action: 'like' | 'pass', profileId: string) => {
    setPendingQueue((prev) => [
      ...prev,
      { id: profileId, action, attempt: 0, nextAttemptAt: Date.now() },
    ]);
  }, []);

  useEffect(() => {
    if (processingRef.current) return;
    if (!pendingQueue.length) return;
    let cancelled = false;
    processingRef.current = true;
    const current = pendingQueue[0];
    const delay = Math.max(0, current.nextAttemptAt - Date.now());
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const endpoint = current.action === 'like' ? '/api/matches/like' : '/api/matches/pass';
        const res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: current.id }),
        });
        if (!res.ok) throw new Error('action failed');
        trackEvent(current.action === 'like' ? 'discover_like_success' : 'discover_pass_success', {
          profileId: current.id,
        });
        setPendingQueue((prev) => prev.slice(1));
      } catch (err) {
        console.error('[discover queue] action failed', err);
        if (current.attempt >= MAX_ATTEMPTS - 1) {
          setError('Some actions did not send. Please try again.');
          trackEvent('discover_action_failed', { profileId: current.id, action: current.action });
          setPendingQueue((prev) => prev.slice(1));
        } else {
          const nextAttemptDelay = Math.min(10000, 1500 * (current.attempt + 1));
          setPendingQueue((prev) => {
            if (!prev.length) return prev;
            const [head, ...rest] = prev;
            if (head.id !== current.id || head.action !== current.action || head.attempt !== current.attempt) {
              return prev;
            }
            const updated = {
              ...head,
              attempt: head.attempt + 1,
              nextAttemptAt: Date.now() + nextAttemptDelay,
            };
            return [updated, ...rest];
          });
        }
      } finally {
        processingRef.current = false;
      }
    }, delay);
    return () => {
      cancelled = true;
      processingRef.current = false;
      clearTimeout(timer);
    };
  }, [pendingQueue]);

  async function handleLike() {
    if (!currentProfile) return;
    setHistory((h) => [...h, { profile: currentProfile, action: 'like' }]);
    setProfiles((prev) => prev.slice(1));
    enqueueAction('like', currentProfile.id);
    trackEvent('discover_like_enqueued', { profileId: currentProfile.id });
  }

  async function handlePass() {
    if (!currentProfile) return;
    setHistory((h) => [...h, { profile: currentProfile, action: 'pass' }]);
    setProfiles((prev) => prev.slice(1));
    enqueueAction('pass', currentProfile.id);
    trackEvent('discover_pass_enqueued', { profileId: currentProfile.id });
  }

  function handleUndo() {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setProfiles((stack) => [last.profile, ...stack]);
      return prev.slice(0, -1);
    });
  }

  const handleRestart = () => {
    setProfiles([]);
    setNextCursor(null);
    fetchProfiles({ replace: true });
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-white via-[#fde7ff] to-[#f5f0ff] flex flex-col items-center">
      <header className="w-full flex justify-between items-center px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white p-2 shadow">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#F500A3" />
              <path d="M18 10v16M10 18h16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-extrabold text-2xl text-fuchsia-700">AmoraVibe</span>
        </div>
        <button
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-800 shadow hover:shadow-md transition"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </header>
      {loadingInitial && (
        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-fuchsia-500 border-solid mx-auto" />
          <div className="text-gray-400 text-lg mt-4">Loading…</div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 bg-white border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-lg z-50 max-w-xs text-sm">
          {error}
          <button className="ml-3 text-xs font-semibold underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <AnimatePresence>
        {currentProfile && (
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center w-full px-4 pb-12"
          >
            <div className="relative w-full max-w-[460px] rounded-[28px] shadow-2xl overflow-hidden bg-white">
              <div className="relative h-[360px] w-full">
                <Image
                  src={(currentProfile.photos && currentProfile.photos[0]) || currentProfile.cover || '/images/default-cover.jpg'}
                  alt={currentProfile.name || 'profile'}
                  width={900}
                  height={900}
                  className="h-full w-full object-cover"
                  priority={history.length === 0}
                  sizes="(max-width: 640px) 100vw, 460px"
                />
                <span className="absolute top-4 right-4 bg-white/90 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
                  {currentProfile.distance || '2 miles away'}
                </span>
                <button
                  className="absolute top-4 left-1/2 -translate-x-1/2 h-1 w-3/4 rounded-full bg-white/70"
                  title="Progress"
                  aria-label="Progress bar"
                  tabIndex={-1}
                />
                <button
                  className="absolute bottom-4 right-4 bg-white/90 text-fuchsia-600 rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  title="More info"
                  aria-label="Show more info"
                  onClick={() => setShowInfo(true)}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="#A21CAF" strokeWidth="2" fill="#F5D0FE" />
                    <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#A21CAF">i</text>
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-2">
                <div className="text-2xl font-extrabold text-gray-900">
                  {currentProfile.name}, {currentProfile.age ?? ''}
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  {currentProfile.job && (
                    <span className="inline-flex items-center gap-1">
                      <span role="img" aria-label="job">💼</span> {currentProfile.job}
                    </span>
                  )}
                  {currentProfile.location && (
                    <span className="inline-flex items-center gap-1">
                      <span role="img" aria-label="location">📍</span> {currentProfile.location}
                    </span>
                  )}
                </div>
                <div className="text-gray-700 text-sm leading-relaxed max-h-20 overflow-y-auto pr-1">
                  {currentProfile.about || 'Adventure seeker and coffee addict. Always up for something new.'}
                </div>
              </div>
            </div>
            <div className="flex gap-8 mt-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-100 text-gray-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={handleUndo}
                title="Undo"
                aria-label="Undo"
              >
                ⟲
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-white border-2 border-red-100 text-red-500 rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-300"
                onClick={handlePass}
                title="Pass"
                aria-label="Pass"
              >
                ✕
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                onClick={handleLike}
                title="Like"
                aria-label="Like"
              >
                ❤
              </motion.button>
            </div>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                  onClick={() => setShowInfo(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  >
                    <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowInfo(false)} aria-label="Close info modal">&times;</button>
                    <div className="font-bold text-2xl mb-2">{currentProfile.name}, {currentProfile.age}</div>
                    <div className="mb-2 text-gray-600">{currentProfile.job} &mdash; {currentProfile.location}</div>
                    <div className="mb-4 text-gray-700">{currentProfile.about}</div>
                    {/* Add more details here as needed */}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {!currentProfile && !loadingInitial && (
        <div className="flex flex-col items-center justify-center w-full mt-10 text-center px-6">
          <div className="text-gray-500 text-lg">You’ve seen everyone in this batch.</div>
          {loadingMore ? (
            <div className="mt-4 text-sm text-gray-400">Fetching more profiles…</div>
          ) : (
            <button
              className="mt-6 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-8 py-3 rounded-full shadow-lg"
              onClick={handleRestart}
            >
              Restart Discovering
            </button>
          )}
        </div>
      )}
      {loadingMore && currentProfile && (
        <div className="mt-6 text-xs text-gray-400">Loading more profiles…</div>
      )}
    </div>
  );
}
