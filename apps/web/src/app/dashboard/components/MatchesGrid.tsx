"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { Match } from "../types";

type MatchesGridProps = {
  matches?: Match[];
};

type RemovedAction = { id: string; action: string; data: Match | undefined };

type ToastState = {
  message: string;
  variant: 'success' | 'error';
  action?: { label: string; payload: { id: string; action: string } };
};

export default function MatchesGrid({ matches: matchesProp }: MatchesGridProps) {
  const [matches, setMatches] = useState<Match[]>(() => matchesProp ?? []);
  const [loading, setLoading] = useState(() => !matchesProp);
  const [error, setError] = useState<string|null>(null);
  const [removed, setRemoved] = useState<RemovedAction[]>([]);
  const [confirm, setConfirm] = useState<{id:string, action:string}|null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout|null>(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (undoTimeout) clearTimeout(undoTimeout);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [undoTimeout]);

  async function refreshMatches() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/matches', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load matches');
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : data.matches ?? []);
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (matchesProp) {
      setMatches(matchesProp);
      setLoading(false);
      return;
    }
    refreshMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesProp]);

  const trackDashboardEvent = useCallback((event: string, detail?: Record<string, unknown>) => {
    try {
      window.dispatchEvent(new CustomEvent('dashboard:telemetry', { detail: { event, ...detail } }));
    } catch (_) {
      // noop if window unavailable
    }
  }, []);

  const showToast = useCallback((next: ToastState, autoDismiss = true) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(next);
    if (autoDismiss) {
      toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
    }
  }, []);

  const handleAction = useCallback((id: string, action: string) => {
    setConfirm({ id, action });
    trackDashboardEvent('match_action_initiated', { id, action });
  }, [trackDashboardEvent]);

  async function confirmAction() {
    if (!confirm) return;
    const { id, action } = confirm;
    setConfirm(null);
    const target = matches.find(m => m.id === id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
    setRemoved((prev) => [{ id, action, data: target }, ...prev]);
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoTimeout(setTimeout(() => {
      setRemoved((prev) => prev.slice(0, -1));
    }, 5000));
    trackDashboardEvent('match_action_confirmed', { id, action });
    try {
      const res = await fetch(`/api/matches/${id}/${action}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Request failed');
      showToast({ message: action === 'like' ? 'Like sent successfully' : 'Match hidden', variant: 'success' });
      await refreshMatches();
    } catch (err) {
      if (target) {
        setMatches((prev) => [target, ...prev]);
      }
      setRemoved((prev) => prev.filter((entry) => entry.id !== id));
      showToast(
        {
          message: 'Action failed. Try again?',
          variant: 'error',
          action: { label: 'Retry', payload: { id, action } },
        },
        false
      );
      trackDashboardEvent('match_action_failed', { id, action, error: (err as Error).message });
    }
  }

  const undoRemove = useCallback(() => {
    if (removed.length === 0) return;
    const [last, ...rest] = removed;
    if (last.data) {
      setMatches((prev) => [last.data as Match, ...prev]);
    }
    setRemoved(rest);
    setConfirm(null);
    if (undoTimeout) clearTimeout(undoTimeout);
    trackDashboardEvent('match_action_undone', { id: last.id, action: last.action });
  }, [removed, undoTimeout, trackDashboardEvent]);

  const sortedMatches = useMemo(() => matches, [matches]);

  const confirmDialog = confirm && mounted
    ? createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <div className="text-lg mb-4">Are you sure you want to <b>{confirm.action === 'like' ? 'Like' : 'Pass'}</b> this match?</div>
            <div className="flex gap-4">
              <button className="bg-gray-200 px-6 py-2 rounded-full" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full" onClick={confirmAction}>Yes</button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  const undoToast = removed.length > 0 && mounted
    ? createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-40">
          <span>Action undone?</span>
          <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 py-1 rounded-full" onClick={undoRemove}>Undo</button>
        </div>,
        document.body
      )
    : null;

  const actionToast = toast && mounted
    ? createPortal(
        <div
          className={`fixed bottom-8 right-8 rounded-2xl px-5 py-3 shadow-lg border ${{ success: 'bg-emerald-50 text-emerald-900 border-emerald-100', error: 'bg-red-50 text-red-900 border-red-100' }[toast.variant]}`}
        >
          <div className="flex items-center gap-3">
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                className="text-sm font-semibold underline"
                onClick={() => {
                  handleAction(toast.action!.payload.id, toast.action!.payload.action);
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
            <button className="text-sm" aria-label="Dismiss" onClick={() => setToast(null)}>
              ✕
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  if (loading) return <div className="text-center py-12 text-lg text-gray-400">Loading matches...</div>;
  if (error) return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
  if (matches.length === 0) return <div className="text-center py-12 text-lg text-gray-400">No matches found.</div>;

  return (
    <>
      {confirmDialog}
      {undoToast}
      {actionToast}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
        {sortedMatches.map((m) => (
          <MatchCard key={m.id} match={m} onAction={handleAction} />
        ))}
      </div>
    </>
  );
}

type MatchCardProps = {
  match: Match;
  onAction: (id: string, action: string) => void;
};

const MatchCard = React.memo(function MatchCard({ match, onAction }: MatchCardProps) {
  return (
    <div
      className="relative group bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col transition-transform hover:scale-105"
    >
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-fuchsia-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow mr-2">
          {match.matchPercent || "95%"} Match
        </span>
        {(match as any).isNew && (
          <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow">
            New Match
          </span>
        )}
      </div>
      <Image
        src={match.avatar || "/images/default-avatar.png"}
        alt={match.name}
        width={640}
        height={288}
        className="w-full h-72 object-cover"
        quality={95}
        priority={false}
      />
      <div className="p-6 flex-1 flex flex-col">
        <div className="font-bold text-2xl mb-1">{match.name}{(match as any).age ? `, ${(match as any).age}` : ''}</div>
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          {(match as any).job && <span>💼 {(match as any).job}</span>}
          {(match as any).location && <span>📍 {(match as any).location}</span>}
        </div>
        {(match as any).about && <div className="text-gray-700 text-base mt-2 line-clamp-2">{(match as any).about}</div>}
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          title="Pass"
          className="bg-white/80 hover:bg-white text-red-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
          onClick={(e) => { e.preventDefault(); onAction(match.id, 'pass'); }}
        >
          &#10006;
        </button>
        <a
          title="Message"
          href={`/messages/${match.id}`}
          className="bg-white/80 hover:bg-white text-blue-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          &#9993;
        </a>
        <button
          title="Like"
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
          onClick={(e) => { e.preventDefault(); onAction(match.id, 'like'); }}
        >
          &#10084;
        </button>
      </div>
    </div>
  );
});
