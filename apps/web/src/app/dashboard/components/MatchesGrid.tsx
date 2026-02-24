"use client";
import React, { useState } from "react";

export default function MatchesGrid({ matches }: { matches: any[] }) {
  const [removed, setRemoved] = useState<{id:string, action:string, data:any}[]>([]);
  const [confirm, setConfirm] = useState<{id:string, action:string}|null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout|null>(null);
  const [localMatches, setLocalMatches] = useState(matches);

  function handleAction(id: string, action: string) {
    setConfirm({ id, action });
  }

  async function confirmAction() {
    if (!confirm) return;
    const { id, action } = confirm;
    setConfirm(null);
    setLocalMatches((prev) => prev.filter((m) => m.id !== id));
    setRemoved((prev) => [{ id, action, data: localMatches.find(m => m.id === id) }, ...prev]);
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoTimeout(setTimeout(() => {
      setRemoved((prev) => prev.slice(0, -1));
    }, 5000));
    if (action === "like") {
      await fetch(`/api/matches/${id}/like`, { method: 'POST', credentials: 'include' });
    } else if (action === "pass") {
      await fetch(`/api/matches/${id}/pass`, { method: 'POST', credentials: 'include' });
    }
  }

  function undoRemove() {
    if (removed.length === 0) return;
    const [last, ...rest] = removed;
    setLocalMatches((prev) => [last.data, ...prev]);
    setRemoved(rest);
    setConfirm(null);
    if (undoTimeout) clearTimeout(undoTimeout);
  }

  return (
    <>
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <div className="text-lg mb-4">Are you sure you want to <b>{confirm.action === 'like' ? 'Like' : 'Pass'}</b> this match?</div>
            <div className="flex gap-4">
              <button className="bg-gray-200 px-6 py-2 rounded-full" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full" onClick={confirmAction}>Yes</button>
            </div>
          </div>
        </div>
      )}
      {removed.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-40">
          <span>Action undone?</span>
          <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 py-1 rounded-full" onClick={undoRemove}>Undo</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {localMatches.map((m) => (
          <div
            key={m.id}
            className="relative group bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col transition-transform hover:scale-105"
          >
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-fuchsia-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow mr-2">
                {m.matchPercent || "95%"} Match
              </span>
              {m.isNew && (
                <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow">
                  New Match
                </span>
              )}
            </div>
            {/* Avatar */}
            <img
              src={m.avatar || "/images/default-avatar.png"}
              alt={m.name}
              className="w-full h-72 object-cover"
            />
            {/* Info */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="font-bold text-2xl mb-1">{m.name}, {m.age}</div>
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <span>💼 {m.job}</span>
                <span>📍 {m.location}</span>
              </div>
              <div className="text-gray-700 text-base mt-2 line-clamp-2">{m.about}</div>
            </div>
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                title="Pass"
                className="bg-white/80 hover:bg-white text-red-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
                onClick={e => { e.preventDefault(); handleAction(m.id, 'pass'); }}
              >
                &#10006;
              </button>
              <a
                title="Message"
                href={`/messages/${m.id}`}
                className="bg-white/80 hover:bg-white text-blue-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
                onClick={e => e.stopPropagation()}
              >
                &#9993;
              </a>
              <button
                title="Like"
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
                onClick={e => { e.preventDefault(); handleAction(m.id, 'like'); }}
              >
                &#10084;
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
