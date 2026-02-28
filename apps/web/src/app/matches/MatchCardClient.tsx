"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { PillButton } from '@lovedate/ui';

type MatchCandidate = {
  id: string;
  displayName?: string;
  city?: string | null;
  photos?: string[];
  compatibilityScore?: number;
  bio?: string | null;
  orientation?: string | null;
  discoverySpace?: string | null;
  isVerified?: boolean;
  mutual?: boolean;
  role?: string | null;
  tags?: string[];
};

export default function MatchCardClient({ match }: { match: MatchCandidate }) {
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState(false);
  const primaryPhoto = match.photos && match.photos.length ? match.photos[0] : null;
  const compatibility = Math.round(match.compatibilityScore ?? 0);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

  async function handleLike() {
    if (busy) return;
    setBusy(true);
    setLiked(true);
    try {
      await fetch(`${API_BASE}/matches/${encodeURIComponent(match.id)}/like`, { method: 'POST', credentials: 'include' });
      // optimistic UI only — server will reconcile
    } catch (e) {
      setLiked(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnmatch() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`${API_BASE}/matches/${encodeURIComponent(match.id)}/unmatch`, { method: 'POST', credentials: 'include' });
      // could remove card or mark status; keep simple for now
    } catch (e) {
      // noop
    } finally {
      setBusy(false);
    }
  }

  async function handleReport() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`${API_BASE}/matches/${encodeURIComponent(match.id)}/report`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // noop
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)] border border-gray-100">
      <div className="relative aspect-[4/5] overflow-hidden">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={`${match.displayName} profile photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500" />
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-purple-700 shadow">
          {compatibility}% Match
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-purple-600 text-white px-3 py-1 text-xs font-semibold shadow">
          New Match
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-xl text-ink-900">{match.displayName ?? ''}</h2>
            <p className="text-sm text-ink-700">{match.role ?? 'Member'}</p>
            <p className="text-xs text-ink-600 flex items-center gap-1">{match.city}</p>
          </div>
        </div>

        <p className="text-sm text-ink-700 line-clamp-2">{match.bio ?? 'Coffee enthusiast, traveler, and design nerd.'}</p>

        {match.tags && match.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-ink-700">
            {match.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-purple-50 text-purple-700 px-3 py-1 font-semibold border border-purple-100"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
