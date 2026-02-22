"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { PillButton } from '@lovedate/ui';

type MatchCandidate = {
  id: string;
  displayName: string;
  city?: string;
  photos: string[];
  compatibilityScore: number;
  bio?: string | null;
  orientation?: string;
  discoverySpace?: string;
  isVerified?: boolean;
  mutual?: boolean;
};

export default function MatchCardClient({ match }: { match: MatchCandidate }) {
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState(false);
  const primaryPhoto = match.photos && match.photos.length ? match.photos[0] : null;
  const compatibilityTone = match.compatibilityScore >= 75 ? 'text-emerald-600' : 'text-ink-700';

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
    <div className="flex flex-col">
      {primaryPhoto ? (
        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-3xl bg-sand-100">
          <Image src={primaryPhoto} alt={`${match.displayName} profile photo`} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
      ) : (
        <div className="mb-4 aspect-[4/5] rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700" />
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink-900">{match.displayName}</h2>
            <p className="text-sm text-ink-600">{match.city}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${compatibilityTone}`}>{match.compatibilityScore}% vibe</span>
            {match.mutual ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs">Mutual</span> : null}
          </div>
        </div>

        <p className="mt-3 flex-1 text-sm text-ink-700">{match.bio ?? 'This member prefers to reveal more in chat.'}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-600">
          <span className="rounded-full bg-sand-100 px-3 py-1 font-medium text-ink-700">Orientation • {match.orientation}</span>
          <span className="rounded-full bg-sand-100 px-3 py-1 font-medium text-ink-700">Discovery • {match.discoverySpace}</span>
          <span className="rounded-full bg-sand-100 px-3 py-1 font-medium text-ink-700">{match.isVerified ? 'Verified' : 'Pending'}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <PillButton onClick={handleLike} disabled={busy} className="flex-1">{liked ? 'Liked' : 'Request intro'}</PillButton>
          <PillButton variant="outline" onClick={handleUnmatch} disabled={busy}>Unmatch</PillButton>
          <PillButton variant="ghost" onClick={handleReport} disabled={busy}>Report</PillButton>
        </div>
      </div>
    </div>
  );
}
