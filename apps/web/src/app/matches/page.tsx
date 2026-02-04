'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Card, PillButton } from '@/lib/ui-components';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Ban } from 'lucide-react';

interface MatchUser {
  id: string;
  displayName: string;
  city?: string;
  photos?: string[];
  trustScore?: number;
  orientation?: string;
  isVerified?: boolean;
}

interface Match {
  id: string;
  otherUser: MatchUser;
  createdAt: string;
  status: 'active' | 'archived' | 'expired';
  lastInteractionAt?: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [archivedMatches, setArchivedMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from URL or session
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get('userId');
    if (urlUserId) {
      setUserId(urlUserId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadMatches = async () => {
      try {
        setLoading(true);
        const [activeRes, archivedRes] = await Promise.all([
          fetch(`/api/dashboard/matches?userId=${userId}&status=active`),
          fetch(`/api/dashboard/matches?userId=${userId}&status=archived`),
        ]);

        const activeData = await activeRes.json();
        const archivedData = await archivedRes.json();

        setMatches(activeData.matches || []);
        setArchivedMatches(archivedData.matches || []);
      } catch (error) {
        console.error('Failed to load matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [userId]);

  const handleUnmatch = async (matchId: string) => {
    if (!userId || !window.confirm('Are you sure you want to unmatch?')) return;

    try {
      const res = await fetch(`/api/dashboard/matches/${matchId}/unmatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setMatches(matches.filter((m) => m.id !== matchId));
      }
    } catch (error) {
      console.error('Failed to unmatch:', error);
    }
  };

  const handleBlock = async (matchId: string, blockedUserId: string) => {
    if (!userId || !window.confirm('Are you sure? This user will be blocked.')) return;

    try {
      const res = await fetch(`/api/dashboard/matches/${matchId}/block`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blockedUserId }),
      });

      if (res.ok) {
        setMatches(matches.filter((m) => m.id !== matchId));
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const currentMatches = activeTab === 'active' ? matches : archivedMatches;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <Badge tone="primary" className="mx-auto w-fit bg-rose-500/10 text-rose-500">
            Matches
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">Not signed in</h1>
          <p className="text-ink-700">Please complete onboarding to view your matches.</p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Start onboarding</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p>Loading matches...</p>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[36px] border border-white/40 bg-white/90 p-8 shadow-[0_30px_100px_rgba(13,15,26,0.12)] backdrop-blur">
        <div>
          <Badge tone="primary" className="mb-4 bg-pink-500/10 text-pink-600">
            Matches
          </Badge>
          <h1 className="font-display text-4xl text-ink-900">Your mutual connections</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-700">
            These are people who liked you and you liked back. Start a conversation or manage your
            connections.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-white/50">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Active ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'archived'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Archived ({archivedMatches.length})
          </button>
        </div>
      </section>

      {/* Matches Grid */}
      <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentMatches.length === 0 ? (
          <Card className="col-span-full space-y-3 text-center">
            <h2 className="font-display text-2xl text-ink-900">
              {activeTab === 'active' ? 'No active matches yet' : 'No archived matches'}
            </h2>
            <p className="text-ink-700">
              {activeTab === 'active'
                ? "When you and someone both like each other, they'll appear here!"
                : 'Your archived matches will appear here.'}
            </p>
          </Card>
        ) : (
          currentMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onUnmatch={handleUnmatch}
              onBlock={handleBlock}
            />
          ))
        )}
      </section>
    </main>
  );
}

function MatchCard({
  match,
  onUnmatch,
  onBlock,
}: {
  match: Match;
  onUnmatch: (matchId: string) => void;
  onBlock: (matchId: string, blockedUserId: string) => void;
}) {
  const primaryPhoto = match.otherUser.photos?.[0];

  return (
    <Card className="flex flex-col overflow-hidden">
      {primaryPhoto ? (
        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-sand-100">
          <Image
            src={primaryPhoto}
            alt={`${match.otherUser.displayName} profile photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="mb-4 aspect-[4/5] rounded-2xl bg-gradient-to-br from-ink-900 to-ink-700" />
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink-900">{match.otherUser.displayName}</h2>
            <p className="text-sm text-ink-600">{match.otherUser.city || 'Location unknown'}</p>
          </div>
          {match.otherUser.isVerified && (
            <Badge tone="primary" className="bg-emerald-100 text-emerald-700 text-xs">
              Verified
            </Badge>
          )}
        </div>

        {/* Match metadata */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-600">
          <span className="rounded-full bg-sand-100 px-3 py-1">
            Matched {new Date(match.createdAt).toLocaleDateString()}
          </span>
          {match.otherUser.orientation && (
            <span className="rounded-full bg-sand-100 px-3 py-1">
              {match.otherUser.orientation}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors font-medium text-sm">
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={() => onUnmatch(match.id)}
            className="flex items-center justify-center px-3 py-2 rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors"
            title="Unmatch"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={() => onBlock(match.id, match.otherUser.id)}
            className="flex items-center justify-center px-3 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            title="Block"
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
