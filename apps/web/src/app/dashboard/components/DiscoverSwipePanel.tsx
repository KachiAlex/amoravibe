import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoverSwipePanel({ onBack }: { onBack?: () => void }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (profiles.length === 0 && !loading) {
      setLoading(true);
      fetch(`/api/discover/profiles?limit=10${nextCursor ? `&cursor=${nextCursor}` : ''}`)
        .then(r => r.json())
        .then(({ profiles: newProfiles, nextCursor: nc }) => {
          setProfiles(newProfiles);
          setNextCursor(nc);
        })
        .finally(() => setLoading(false));
    }
  }, [profiles, nextCursor, loading]);

  async function handleLike() {
    if (!profiles[idx]) return;
    try {
      setHistory(h => [...h, { ...profiles[idx], action: 'like' }]);
      const id = profiles[idx].id;
      await fetch(`/api/matches/${id}/like`, { method: 'POST', credentials: 'include' });
      nextProfile('like');
    } catch (e) {
      setError('Failed to like profile.');
    }
  }
  async function handlePass() {
    if (!profiles[idx]) return;
    try {
      setHistory(h => [...h, { ...profiles[idx], action: 'pass' }]);
      const id = profiles[idx].id;
      await fetch(`/api/matches/${id}/pass`, { method: 'POST', credentials: 'include' });
      nextProfile('pass');
    } catch (e) {
      setError('Failed to pass profile.');
    }
  }
  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setProfiles([last, ...profiles]);
    setHistory(history.slice(0, -1));
    setIdx(0);
  }
  function nextProfile(action?: string) {
    if (idx + 1 < profiles.length) {
      setIdx(idx + 1);
    } else {
      setProfiles([]);
      setIdx(0);
    }
  }

  const profile = profiles[idx];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-white via-fuchsia-50 to-purple-50">
      <header className="w-full flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 p-2"><svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#fff"/><path d="M18 10v16M10 18h16" stroke="#F500A3" strokeWidth="2.5" strokeLinecap="round"/></svg></span>
          <span className="font-bold text-2xl text-fuchsia-700">AmoraVibe</span>
        </div>
        <button className="bg-gray-100 px-6 py-2 rounded-full text-lg font-medium shadow" onClick={onBack}>Back to Dashboard</button>
      </header>
      {loading && (
        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-fuchsia-500 border-solid mx-auto" />
          <div className="text-gray-400 text-lg mt-4">Loading…</div>
        </div>
      )}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg z-50">
          {error}
          <button className="ml-2 text-xs underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <AnimatePresence>
        {profile && (
          <motion.div
            key={profile.id || idx}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white mt-4">
              <img src={profile.cover || '/images/default-cover.jpg'} alt="cover" className="w-full h-80 object-cover" style={{borderTopLeftRadius:'1.5rem',borderTopRightRadius:'1.5rem'}} />
              <span className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-700 text-base font-semibold px-4 py-2 rounded-full shadow">{profile.distance || '2 miles away'}</span>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-white/80 rounded-full" />
              <div className="absolute top-72 right-6">
                <button
                  className="bg-fuchsia-100 text-fuchsia-600 rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  title="More info"
                  aria-label="Show more info"
                  onClick={() => setShowInfo(true)}
                >
                  <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#F5D0FE"/><text x="14" y="20" textAnchor="middle" fontSize="18" fill="#A21CAF">i</text></svg>
                </button>
              </div>
              <div className="p-8 pb-6">
                <div className="font-extrabold text-3xl mb-2 text-gray-900">{profile.name}, {profile.age}</div>
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <span className="inline-flex items-center gap-1"><span role="img" aria-label="job">💼</span> {profile.job}</span>
                  <span className="inline-flex items-center gap-1"><span role="img" aria-label="location">📍</span> {profile.location}</span>
                </div>
                <div className="text-gray-700 text-base mt-2 max-h-16 overflow-y-auto">{profile.about}</div>
              </div>
            </div>
            <div className="flex gap-10 mt-10">
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="bg-gray-100 text-gray-400 rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                onClick={handleUndo}
                title="Undo"
                aria-label="Undo"
              >
                &#8630;
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="bg-white border-4 border-white text-red-500 rounded-full w-20 h-20 flex items-center justify-center text-4xl shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={handlePass}
                title="Pass"
                aria-label="Pass"
              >
                &#10006;
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-4xl shadow-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                onClick={handleLike}
                title="Like"
                aria-label="Like"
              >
                &#10084;
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
                    onClick={e => e.stopPropagation()}
                  >
                    <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowInfo(false)} aria-label="Close info modal">&times;</button>
                    <div className="font-bold text-2xl mb-2">{profile.name}, {profile.age}</div>
                    <div className="mb-2 text-gray-600">{profile.job} &mdash; {profile.location}</div>
                    <div className="mb-4 text-gray-700">{profile.about}</div>
                    {/* Add more details here as needed */}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {!profile && !loading && (
        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div className="text-gray-400 text-lg">No more profiles</div>
          <button className="mt-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg" onClick={() => setProfiles([])}>Restart Discovering</button>
        </div>
      )}
    </div>
  );
}
