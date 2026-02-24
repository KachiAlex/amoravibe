import React, { useState, useEffect } from "react";

export default function DiscoverSwipePanel({ onBack }: { onBack?: () => void }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

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

  function handleLike() {
    if (!profiles[idx]) return;
    // Optimistically remove
    setHistory(h => [...h, { ...profiles[idx], action: 'like' }]);
    nextProfile();
    // Optionally: POST /api/matches/like
  }
  function handlePass() {
    if (!profiles[idx]) return;
    setHistory(h => [...h, { ...profiles[idx], action: 'pass' }]);
    nextProfile();
    // Optionally: POST /api/matches/pass
  }
  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setProfiles([last, ...profiles]);
    setHistory(history.slice(0, -1));
    setIdx(0);
  }
  function nextProfile() {
    if (idx + 1 < profiles.length) {
      setIdx(idx + 1);
    } else {
      // Fetch next batch
      setProfiles([]);
      setIdx(0);
    }
  }

  const profile = profiles[idx];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex justify-between w-full max-w-xl mb-6">
        <button className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 font-medium" onClick={onBack}>Back to Dashboard</button>
      </div>
      {loading && <div className="text-gray-400 text-lg">Loading…</div>}
      {profile && (
        <div className="relative w-full max-w-xl">
          <div className="rounded-3xl shadow-xl overflow-hidden bg-white">
            <div className="relative">
              <img src={profile.cover || '/images/default-cover.jpg'} alt="cover" className="w-full h-72 object-cover" />
              <span className="absolute top-4 right-4 bg-white bg-opacity-80 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full shadow">{profile.distance || ''}</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <img src={profile.avatar || '/images/default-avatar.png'} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-fuchsia-200" />
                <div className="font-bold text-xl">{profile.name}, {profile.age}</div>
                <button className="ml-auto bg-fuchsia-50 text-fuchsia-700 rounded-full p-2" title="More info">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#F500A3"/><text x="10" y="15" textAnchor="middle" fontSize="14" fill="#fff">i</text></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <span>🧑‍🎨 {profile.job}</span>
                <span>📍 {profile.location}</span>
              </div>
              <div className="text-gray-700 text-sm mt-2">{profile.about}</div>
            </div>
          </div>
        </div>
      )}
      {!profile && !loading && <div className="text-gray-400 text-lg">No more profiles</div>}
      <div className="flex gap-6 mt-8">
        <button className="bg-gray-100 text-gray-500 rounded-full w-12 h-12 flex items-center justify-center text-xl" onClick={handleUndo} title="Undo">
          &#8630;
        </button>
        <button className="bg-white border border-gray-300 text-red-500 rounded-full w-12 h-12 flex items-center justify-center text-xl" onClick={handlePass} title="Pass">
          &#10006;
        </button>
        <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl" onClick={handleLike} title="Like">
          &#10084;
        </button>
      </div>
    </div>
  );
}
