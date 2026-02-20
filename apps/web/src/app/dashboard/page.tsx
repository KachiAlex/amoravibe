import React, { type ReactNode } from 'react';
import { Card, PillButton } from '@lovedate/ui';
import Link from 'next/link';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Compass, Heart, Star, MessageCircle, Users, ShieldCheck, Settings } from 'lucide-react';
import type {
  EngagementDashboardResponse,
  DiscoverFeedMode,
  DiscoverFeedResponse,
  DiscoverFilterOption,
  DiscoverCard,
  DiscoverEventAction,
  DiscoverEventPayload,
  LikeActionType,
  MatchCandidate,
  TrustCenterSnapshotResponse,
  MessagingThread,
} from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import { getSession } from '@/lib/session';
import { buildMessagingFallback } from '@/lib/messaging';
import { LikeActionSubmitButton } from './like-action-submit-button';
import dynamic from 'next/dynamic';

const HeroStatsClient = dynamic(() => import('./HeroStatsClient'), { ssr: false });

const sidebarFont = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600'] });

const DISCOVER_MODES: DiscoverFeedMode[] = [
  'default',
  'verified',
  'nearby',
  'fresh',
  'premium',
  'shared',
];
const DISCOVER_FEED_LIMIT = 12;

const DEFAULT_DISCOVER_FILTERS: DiscoverFilterOption[] = [
  { label: 'Curated for you', helper: 'Compatibility weighted', value: 'default' },
  { label: 'Verified orbit', helper: 'Photo / ID verified', value: 'verified' },
  { label: 'Nearby now', helper: 'Within 10 miles', value: 'nearby' },
  { label: 'New this week', helper: 'Freshly onboarded', value: 'fresh' },
  { label: 'Premium spotlights', helper: 'High-intent members', value: 'premium', premium: true },
  { label: 'Shared interests', helper: 'Mutual lifestyle tags', value: 'shared' },
];

const DISCOVER_EVENT_ACTIONS: DiscoverEventAction[] = [
  'view',
  'like',
  'pass',
  'save',
  'dismiss',
  'filter',
];

const deriveModeFromLabel = (label?: string): DiscoverFeedMode => {
  if (!label || typeof label !== 'string') return 'default';
  const normalized = label.toLowerCase();
  if (normalized.includes('verified')) return 'verified';
  if (normalized.includes('near')) return 'nearby';
  if (normalized.includes('new') || normalized.includes('fresh')) return 'fresh';
  if (normalized.includes('premium')) return 'premium';
  if (normalized.includes('shared') || normalized.includes('interest')) return 'shared';
  return 'default';
};

const isDiscoverMode = (value: unknown): value is DiscoverFeedMode =>
  typeof value === 'string' && DISCOVER_MODES.includes(value as DiscoverFeedMode);

const isDiscoverEventAction = (value: unknown): value is DiscoverEventAction =>
  typeof value === 'string' && DISCOVER_EVENT_ACTIONS.includes(value as DiscoverEventAction);

const STATIC_DISCOVER_CARDS: DiscoverCard[] = [
  {
    id: 'peter',
    name: 'Peter',
    age: 29,
    city: 'Brooklyn, NY',
    cityRegion: 'Brooklyn',
    distance: '3 mi',
    distanceKm: 5,
    tags: ['Travel', 'Photography', 'Dogs'],
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    compatibility: 84,
    verified: true,
    premiumOnly: false,
    receiverId: 'peter',
    actionable: false,
  },
  {
    id: 'chloe',
    name: 'Chloe',
    age: 25,
    city: 'SoHo, NY',
    cityRegion: 'Manhattan',
    distance: '5 mi',
    distanceKm: 8,
    tags: ['Art', 'Ceramics', 'Slow mornings'],
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    compatibility: 72,
    verified: true,
    premiumOnly: true,
    receiverId: 'chloe',
    actionable: false,
  },
  {
    id: 'aaron',
    name: 'Aaron',
    age: 32,
    city: 'Lower East Side, NY',
    cityRegion: 'Manhattan',
    distance: '1 mi',
    distanceKm: 2,
    tags: ['Coffee shops', 'Film festivals'],
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    compatibility: 69,
    verified: false,
    premiumOnly: false,
    receiverId: 'aaron',
    actionable: false,
  },
];

const applyActiveStateToFilters = (
  filters: DiscoverFilterOption[],
  mode: DiscoverFeedMode
): DiscoverFilterOption[] =>
  filters.map((filter) => {
    const value = filter.value ?? deriveModeFromLabel(filter.label);
    return {
      ...filter,
      value,
      active: value === mode,
    };
  });

const createDiscoverFeedFromCards = (
  cards: DiscoverCard[],
  mode: DiscoverFeedMode,
  filters: DiscoverFilterOption[] = DEFAULT_DISCOVER_FILTERS
): DiscoverFeedResponse => ({
  hero: cards[0] ?? null,
  featured: cards.slice(1, 3),
  grid: cards.slice(3, 12),
  filters: applyActiveStateToFilters(filters, mode),
  total: cards.length,
  mode,
  generatedAt: new Date().toISOString(),
});

const normalizeDiscoverFeed = (
  feed: DiscoverFeedResponse | null,
  fallback: DiscoverFeedResponse
): DiscoverFeedResponse => {
  if (!feed) {
    return fallback;
  }

  return {
    ...feed,
    hero: feed.hero ?? fallback.hero,
    featured: feed.featured?.length ? feed.featured : fallback.featured,
    grid: feed.grid?.length ? feed.grid : fallback.grid,
    filters: applyActiveStateToFilters(
      feed.filters?.length ? feed.filters : fallback.filters,
      feed.mode ?? fallback.mode
    ),
    total: typeof feed.total === 'number' ? feed.total : fallback.total,
  };
};

const mapCardToDiscoverPerson = (card: DiscoverCard, mode: DiscoverFeedMode): DiscoverPerson => ({
  id: card.id,
  name: card.name,
  age: card.age ?? null,
  city: card.city ?? null,
  cityRegion: card.cityRegion ?? null,
  distance: card.distance ?? null,
  tags: card.tags ?? [],
  image: card.image,
  compatibility: card.compatibility,
  verified: card.verified,
  premiumOnly: card.premiumOnly,
  receiverId: card.receiverId,
  actionable: card.actionable,
  mode,
});

const STATUS_TONE_STYLES: Record<MessagingThread['status']['tone'], { pill: string; dot: string }> =
  {
    violet: { pill: 'bg-[#f5f3ff] text-[#5b21b6]', dot: 'bg-[#a78bfa]' },
    rose: { pill: 'bg-[#fef2f2] text-[#b91c1c]', dot: 'bg-[#fb7185]' },
    amber: { pill: 'bg-[#fffbeb] text-[#a16207]', dot: 'bg-[#f59e0b]' },
    emerald: { pill: 'bg-[#ecfdf5] text-[#047857]', dot: 'bg-[#34d399]' },
  };

import type { LucideIcon } from 'lucide-react';
type IconType = LucideIcon;

type DashboardSection = 'home' | 'discover' | 'messages';

interface NavItem {
  label: string;
  icon: IconType;
  href: string;
  badge?: string;
  section?: DashboardSection;
}

function ProfileManager({
  completion,
  photos,
  trustScore,
  verified,
}: {
  completion: number;
  photos: string[];
  trustScore: number;
  verified: boolean;
}) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Profile</p>
          <h3 className="text-xl font-semibold text-[#0f172a]">Tell your story</h3>
        </div>
        <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-semibold text-[#4338ca]">
          {completion}% complete
        </span>
      </header>
      <div className="rounded-2xl border border-dashed border-[#e2e8f0] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#94a3b8]">Photos</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.length ? (
            photos.map((photo) => (
              <div key={photo} className="relative h-24 overflow-hidden rounded-xl border">
                <Image src={photo} alt="Profile photo" fill className="object-cover" sizes="33vw" />
              </div>
            ))
          ) : (
            <p className="col-span-3 text-sm text-[#94a3b8]">Add photos to increase trust.</p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href="/settings/profile"
            className="rounded-full bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white"
          >
            Manage photos
          </Link>
          <button className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#0f172a]">
            Edit prompts
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e2e8f0] p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">Trust score</p>
          <p className="text-sm font-semibold text-[#0f172a]">{trustScore}/100</p>
          <p className="text-xs text-[#94a3b8]">Higher trust boosts discovery ranking.</p>
        </div>
        <div className="rounded-2xl border border-[#e2e8f0] p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">Verification</p>
          <p className="text-sm font-semibold text-[#0f172a]">
            {verified ? 'Profile verified' : 'Verification pending'}
          </p>
          <p className="text-xs text-[#94a3b8]">Complete ID check to unlock badges.</p>
        </div>
      </div>
    </Card>
  );
}

function VerificationPanel({
  timeline,
  verifiedLabel,
}: {
  timeline: { title: string; helper: string; status: 'done' | 'pending' }[];
  verifiedLabel: string;
}) {
  return (
    <Card className="space-y-4 border-none bg-[#0f172a] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.3)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/70">
            Verification
          </p>
          <h3 className="text-2xl font-semibold">Your trust tier</h3>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
          {verifiedLabel}
        </span>
      </header>
      <div className="space-y-3">
        {timeline.map((step) => (
          <div
            key={step.title}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              step.status === 'done'
                ? 'border-white/40 bg-white/10'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
          >
            <p className="font-semibold">{step.title}</p>
            <p className="text-white/70">{step.helper}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/10 p-4 text-sm">
        Add ID verification to boost visibility.{' '}
        <Link href="/trust-center" className="font-semibold underline">
          Start verification
        </Link>
      </div>
    </Card>
  );
}

function LikesSplitPanel({ received, sent }: { received: LikePerson[]; sent: LikePerson[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Likes</p>
          <h3 className="text-xl font-semibold text-[#0f172a]">Signals and admirers</h3>
        </div>
        <Link href="/matches?view=likes" className="text-sm font-semibold text-[#4338ca]">
          Manage likes
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#e2e8f0] p-4">
          <p className="text-sm font-semibold text-[#0f172a]">People who liked you</p>
          <p className="text-xs text-[#94a3b8]">Upgrade to reveal instantly.</p>
          <div className="mt-3 space-y-3">
            {received.map((like) => (
              <div key={like.id} className="flex items-center gap-3">
                <Image
                  src={like.image}
                  alt={like.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-2xl object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">{like.name}</p>
                  <p className="text-xs text-[#94a3b8]">Blurred for privacy</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/premium" className="mt-3 inline-flex text-sm font-semibold text-[#7c3aed]">
            See who liked you →
          </Link>
        </div>
        <div className="rounded-2xl border border-[#e2e8f0] p-4">
          <p className="text-sm font-semibold text-[#0f172a]">People you liked</p>
          <p className="text-xs text-[#94a3b8]">Rewind or send a message.</p>
          <div className="mt-3 space-y-3">
            {sent.map((like) => (
              <div key={like.id} className="flex items-center gap-3">
                <Image
                  src={like.image}
                  alt={like.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0f172a]">{like.name}</p>
                  <p className="text-xs text-[#94a3b8]">{like.highlight}</p>
                </div>
                <button className="rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-semibold text-[#15803d]">
                  Nudge
                </button>
              </div>
            ))}
          </div>
          <button className="mt-3 inline-flex text-sm font-semibold text-[#4338ca]">
            Rewind last swipe
          </button>
        </div>
      </div>
    </Card>
  );
}

function MessagesInbox({ threads }: { threads: MessagingThread[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Messages</p>
          <h3 className="text-xl font-semibold text-[#0f172a]">Inbox</h3>
        </div>
        <Link
          href="/dashboard?section=messages#messages"
          className="text-sm font-semibold text-[#4338ca]"
        >
          View all
        </Link>
      </header>
      <div className="space-y-4">
        {threads.map((thread) => {
          const toneStyles = STATUS_TONE_STYLES[thread.status.tone];
          return (
            <div
              key={thread.id}
              className="rounded-2xl border border-[#eef2ff] p-3 transition hover:border-[#cbd5f5]"
            >
              <Link href={thread.route} className="flex items-start gap-3">
                <Image
                  src={thread.avatar}
                  alt={thread.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0f172a]">{thread.name}</p>
                    <span className="text-xs text-[#94a3b8]">{thread.lastActive}</span>
                  </div>
                  <p className="text-xs text-[#475569]">{thread.snippet}</p>
                  <p className="text-xs text-[#94a3b8]">{thread.vibeLine}</p>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${toneStyles.pill}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${toneStyles.dot}`} />
                    {thread.status.label}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs text-[#94a3b8]">
                  {thread.unread ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f43f5e] text-[11px] font-semibold text-white">
                      {thread.unread}
                    </span>
                  ) : null}
                </div>
              </Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {thread.quickReplies.map((reply) => (
                  <button
                    type="button"
                    key={`${thread.id}-${reply}`}
                    className="rounded-full border border-[#e2e8f0] px-3 py-1 text-xs font-medium text-[#4338ca] hover:border-[#cbd5f5]"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MatchesPanel({ candidates }: { candidates: MatchCandidatePreview[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Matches hub</p>
          <h3 className="text-xl font-semibold text-[#0f172a]">Mutual sparks</h3>
        </div>
        <Link href="/matches" className="text-sm font-semibold text-[#4338ca]">
          View all
        </Link>
      </header>
      <div className="space-y-3">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between rounded-2xl border border-[#eef2ff] p-3"
          >
            <div className="flex items-center gap-3">
              <Image
                src={candidate.avatar}
                alt={candidate.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-2xl object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">{candidate.name}</p>
                <p className="text-xs text-[#475569]">{candidate.highlight}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  candidate.status === 'new'
                    ? 'bg-[#fef2f2] text-[#b91c1c]'
                    : candidate.status === 'active'
                      ? 'bg-[#ecfeff] text-[#0f766e]'
                      : 'bg-[#fff7ed] text-[#b45309]'
                }`}
              >
                {candidate.status === 'new'
                  ? 'New match'
                  : candidate.status === 'active'
                    ? 'Active chat'
                    : 'Expiring soon'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[#8f63ff] to-[#ff79c6] px-3 py-1 text-xs font-semibold text-white shadow-sm">{candidate.compatibility}% match</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotificationsPanel({ toggles }: { toggles: NotificationToggle[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header>
        <p className="text-sm font-medium text-[#6b7280]">Notifications</p>
        <h3 className="text-xl font-semibold text-[#0f172a]">Stay in the loop</h3>
      </header>
      <div className="space-y-3">
        {toggles.map((toggle) => (
          <button
            key={toggle.channel}
            type="button"
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              toggle.enabled
                ? 'border-[#c7d7fe] bg-[#eef2ff]'
                : 'border-[#e2e8f0] hover:border-[#cbd5f5]'
            }`}
          >
            <span>
              <p className="text-sm font-semibold text-[#0f172a]">{toggle.label}</p>
              <p className="text-xs text-[#94a3b8]">{toggle.helper}</p>
            </span>
            <span
              className={`inline-flex h-6 w-11 items-center rounded-full text-[11px] font-semibold ${
                toggle.enabled
                  ? 'bg-[#4338ca]/90 text-white justify-end'
                  : 'bg-[#e2e8f0] text-[#475569] justify-start'
              }`}
            >
              <span className="mx-1 rounded-full bg-white p-1" />
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function PremiumPanel({ perks }: { perks: PremiumPerk[] }) {
  return (
    <Card className="space-y-4 border-none bg-gradient-to-br from-[#fdf2f8] via-[#faf5ff] to-[#ecfeff] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Premium & boosts</p>
          <h3 className="text-xl font-semibold text-[#0f172a]">Unlock AmoraVibe+</h3>
        </div>
        <Link
          href="/premium"
          className="rounded-full bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white"
        >
          Upgrade
        </Link>
      </header>
      <div className="space-y-3">
        {perks.map((perk) => (
          <div key={perk.title} className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#0f172a]">{perk.title}</p>
            <p className="text-xs text-[#475569]">{perk.helper}</p>
            <button className="mt-2 text-sm font-semibold text-[#7c3aed]">{perk.cta} →</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SafetySupportPanel({ resources }: { resources: SafetyResource[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header>
        <p className="text-sm font-medium text-[#6b7280]">Safety & support</p>
        <h3 className="text-xl font-semibold text-[#0f172a]">We’ve got you</h3>
      </header>
      <div className="space-y-3">
        {resources.map((resource) => (
          <Link
            key={resource.href}
            href={resource.href}
            className="flex items-center justify-between rounded-2xl border border-[#e2e8f0] px-4 py-3 text-[#0f172a] hover:border-[#cbd5f5]"
          >
            <span>
              <p className="text-sm font-semibold">{resource.title}</p>
              <p className="text-xs text-[#94a3b8]">{resource.helper}</p>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
              Open
            </span>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl bg-[#eef2ff] p-4 text-sm text-[#4338ca]">
        Need immediate help?{' '}
        <Link href="/support/contact" className="font-semibold underline">
          Contact support
        </Link>
      </div>
    </Card>
  );
}

function SettingsPanel({ items }: { items: SettingItem[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      <header>
        <p className="text-sm font-medium text-[#6b7280]">Settings</p>
        <h3 className="text-xl font-semibold text-[#0f172a]">Control your account</h3>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-2xl border px-4 py-3 transition ${
              item.tone === 'danger'
                ? 'border-[#fecdd3] bg-[#fff1f2] text-[#b91c1c]'
                : 'border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5f5]'
            }`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-xs text-[#94a3b8]">{item.helper}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function HomeFeed({ profiles, senderId }: { profiles: FeedProfile[]; senderId?: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <FeedCard key={profile.id} profile={profile} senderId={senderId} />
      ))}
    </div>
  );
}

function FeedCard({ profile, senderId }: { profile: FeedProfile; senderId?: string }) {
  return (
    <Card className="space-y-4 border-none bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <Image
          src={profile.photo}
          alt={`${profile.name} profile photo`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {profile.premiumOnly ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/70 text-white">
            <LucideIcons.Lock className="mb-2 h-6 w-6" />
            <p className="text-sm font-semibold">Premium spotlight</p>
            <Link href="/premium" className="text-xs underline">
              Unlock to view
            </Link>
          </div>
        ) : null}
        {profile.verified ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0f172a]">
            Verified
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-semibold text-[#0f172a]">
              {profile.name}, {profile.age}
            </p>
            <p className="text-sm text-[#475569]">{profile.location}</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
            {profile.distance}
          </span>
        </div>
        <p className="text-sm text-[#475569]">
          <span className="font-semibold text-[#0f172a]">{profile.intent}</span> · {profile.bio}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-[#6366f1]">
          <span className="rounded-full bg-[#eef2ff] px-3 py-1">{profile.orientation}</span>
          {profile.interests.map((interest) => (
            <span key={interest} className="rounded-full bg-[#f5f3ff] px-3 py-1 text-[#7c3aed]">
              {interest}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <LikeActionButton
          senderId={senderId}
          receiverId={profile.receiverId}
          action="like"
          highlight={`Home feed like for ${profile.name}`}
          className="flex-1 rounded-full bg-[#22c55e] px-5 py-2 text-sm font-semibold text-white shadow-sm"
          disabled={!profile.actionable}
        >
          Like
        </LikeActionButton>
        <LikeActionButton
          senderId={senderId}
          receiverId={profile.receiverId}
          action="pass"
          highlight={`Passed on ${profile.name}`}
          className="flex-1 rounded-full border border-[#e2e8f0] px-5 py-2 text-sm font-semibold text-[#0f172a]"
          disabled={!profile.actionable}
        >
          Pass
        </LikeActionButton>
        <LikeActionButton
          senderId={senderId}
          receiverId={profile.receiverId}
          action="save"
          highlight={`Saved ${profile.name}`}
          className="rounded-full border border-[#c084fc] px-4 py-2 text-sm font-semibold text-[#7c3aed]"
          disabled={!profile.actionable}
        >
          Save
        </LikeActionButton>
        <LikeActionButton
          senderId={senderId}
          receiverId={profile.receiverId}
          action="like"
          highlight={`Super-like sent to ${profile.name}`}
          className="rounded-full bg-[#f43f5e] px-4 py-2 text-sm font-semibold text-white"
          disabled={!profile.actionable}
        >
          Super-like
        </LikeActionButton>
      </div>
    </Card>
  );
}

function DiscoverFilters({
  filters,
  activeMode,
  userId,
}: {
  filters: DiscoverFilterOption[];
  activeMode: DiscoverFeedMode;
  userId: string;
}) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-sm font-medium text-[#6b7280]">Explore modes</p>
        <h3 className="text-xl font-semibold text-[#0f172a]">Tune your discovery lane</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filters.map((filter) => {
          const value = filter.value ?? deriveModeFromLabel(filter.label);
          const isActive = filter.active ?? value === activeMode;

          return (
            <form action={selectDiscoverModeAction} key={`${filter.label}-${value}`}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="mode" value={value} />
              <button
                type="submit"
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-[#4338ca] bg-[#eef2ff] text-[#1e1b4b] shadow-sm'
                    : filter.premium
                      ? 'border-[#fcd34d] bg-[#fffbeb] text-[#92400e]'
                      : 'border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5f5]'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span>
                  <p className="text-sm font-semibold">{filter.label}</p>
                  <p className="text-xs text-[#94a3b8]">{filter.helper}</p>
                </span>
                {filter.premium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#b45309]">
                    <LucideIcons.Lock className="h-3 w-3" /> Premium
                  </span>
                ) : null}
              </button>
            </form>
          );
        })}
      </div>
    </Card>
  );
}

interface DiscoverPerson {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  cityRegion?: string | null;
  distance?: string | null;
  tags: string[];
  image: string;
  compatibility?: number;
  verified: boolean;
  premiumOnly?: boolean;
  receiverId?: string;
  actionable?: boolean;
  mode?: DiscoverFeedMode;
}

function LikeActionButton({
  senderId,
  receiverId,
  action,
  highlight,
  children,
  className,
  disabled,
  telemetry,
  pendingLabel,
}: {
  senderId?: string | null;
  receiverId?: string;
  action: LikeActionType;
  highlight?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  telemetry?: {
    action: DiscoverEventAction;
    cardUserId?: string;
    filter?: DiscoverFeedMode;
    surface?: string;
  };
  pendingLabel?: string;
}) {
  if (!senderId || !receiverId) {
    return (
      <button type="button" className={className} disabled>
        {children}
      </button>
    );
  }

  const defaultPendingLabel =
    action === 'pass' ? 'Passing…' : action === 'save' ? 'Saving…' : 'Sending…';
  const resolvedPendingLabel = pendingLabel ?? defaultPendingLabel;

  return (
    <form action={applyLikeAction} className="flex-1">
      <input type="hidden" name="senderId" value={senderId} />
      <input type="hidden" name="receiverId" value={receiverId} />
      <input type="hidden" name="action" value={action} />
      {highlight ? <input type="hidden" name="highlight" value={highlight} /> : null}
      {telemetry ? (
        <>
          <input type="hidden" name="telemetryAction" value={telemetry.action} />
          {telemetry.cardUserId ? (
            <input type="hidden" name="telemetryCardUserId" value={telemetry.cardUserId} />
          ) : null}
          {telemetry.filter ? (
            <input type="hidden" name="telemetryFilter" value={telemetry.filter} />
          ) : null}
          {telemetry.surface ? (
            <input type="hidden" name="telemetrySurface" value={telemetry.surface} />
          ) : null}
        </>
      ) : null}
      <LikeActionSubmitButton
        className={className}
        disabled={disabled}
        pendingLabel={resolvedPendingLabel}
      >
        {children}
      </LikeActionSubmitButton>
    </form>
  );
}

interface LikePerson extends DiscoverPerson {
  highlight: string;
  likeEdgeId?: string;
  premiumOnly?: boolean;
}

interface MatchPreview {
  name: string;
  compatibility: string;
  highlight: string;
  status: string;
  accent: string;
  avatar: string;
}

interface FeedProfile {
  id: string;
  name: string;
  age?: number;
  distance?: string;
  location?: string;
  orientation: string;
  intent: string;
  bio: string;
  photo: string;
  verified: boolean;
  premiumOnly?: boolean;
  interests: string[];
  isLive?: boolean;
  receiverId?: string;
  actionable?: boolean;
}

interface MatchCandidatePreview {
  id: string;
  name: string;
  status: 'new' | 'active' | 'expiring';
  highlight: string;
  compatibility: number;
  avatar: string;
  verified?: boolean;
}

interface NotificationToggle {
  channel: string;
  label: string;
  helper: string;
  enabled: boolean;
}

interface PremiumPerk {
  title: string;
  helper: string;
  cta: string;
}

interface SafetyResource {
  title: string;
  helper: string;
  href: string;
}

interface SettingItem {
  label: string;
  helper: string;
  href: string;
  tone?: 'default' | 'danger';
}

interface DashboardPageProps {
  searchParams?:
    | Promise<{ userId?: string; section?: string; discoverMode?: string }>
    | { userId?: string; section?: string; discoverMode?: string };
}

async function getSeedSnapshot(userId: string): Promise<TrustCenterSnapshotResponse> {
  // Minimal seeded snapshot used for E2E / CI when the identity backend is unavailable.
  return {
    snapshotLabel: 'seeded-e2e-snapshot',
    user: {
      id: userId,
      email: `${userId}@example.com`,
      displayName: userId === 'user_2' ? 'E2E Test User' : 'Seed User',
      isVerified: true,
    } as any,
    devices: [],
    engagements: {
      sentLikes: [],
      receivedLikes: [],
      recentMatches: [],
    } as any,
    matches: [],
  } as TrustCenterSnapshotResponse;
}

async function loadSnapshot(userId: string): Promise<TrustCenterSnapshotResponse | null> {
  // E2E / CI-only override: return a seeded snapshot when the test runner enables it.
  if (process.env.NEXT_PUBLIC_USE_SEED_SNAPSHOT === '1') {
    try {
      return await getSeedSnapshot(userId);
    } catch (error) {
      console.error('Failed to load seeded snapshot', error);
      return null;
    }
  }

  try {
    return await lovedateApi.fetchTrustSnapshot(userId);
  } catch (error) {
    console.error('Failed to load trust snapshot', error);
    return null;
  }
}

async function loadMatches(userId: string, limit = 12): Promise<MatchCandidate[] | null> {
  try {
    return await lovedateApi.fetchMatches({ userId, limit });
  } catch (error) {
    console.error('Failed to load matches for dashboard', error);
    return null;
  }
}

async function loadEngagementDashboard(
  userId: string
): Promise<EngagementDashboardResponse | null> {
  try {
    return await lovedateApi.fetchEngagementDashboard(userId);
  } catch (error) {
    console.error('Failed to load engagement dashboard', error);
    return null;
  }
}

async function loadMessagingThreads(userId: string, limit = 6): Promise<MessagingThread[]> {
  try {
    const threads = await lovedateApi.fetchMessagingThreads(userId, limit);
    if (threads.length) {
      return threads;
    }
  } catch (error) {
    console.error('Failed to load messaging threads', error);
  }

  return buildMessagingFallback(userId, limit);
}

async function loadDiscoverFeed(
  userId: string,
  mode: DiscoverFeedMode,
  limit = DISCOVER_FEED_LIMIT
): Promise<DiscoverFeedResponse | null> {
  try {
    return await lovedateApi.fetchDiscoverFeed({ userId, mode, limit });
  } catch (error) {
    console.error('Failed to load discover feed', error);
    return null;
  }
}

async function applyLikeAction(formData: FormData) {
  'use server';

  const senderId = formData.get('senderId')?.toString();
  const receiverId = formData.get('receiverId')?.toString();
  const action = formData.get('action')?.toString() as LikeActionType | undefined;
  const highlight = formData.get('highlight')?.toString();

  if (!senderId || !receiverId || !action) {
    return;
  }

  await lovedateApi.likeUser({
    senderId,
    receiverId,
    action,
    highlight: highlight?.trim() ? highlight : undefined,
  });

  await maybeTrackDiscoverEvent(formData, senderId, receiverId);

  revalidatePath('/dashboard');
}

async function nudgeLikeAction(formData: FormData) {
  'use server';

  const likeId = formData.get('likeId')?.toString();
  if (!likeId) {
    return;
  }

  await lovedateApi.nudgeLike(likeId);
  revalidatePath('/dashboard');
}

async function toggleNotificationAction(formData: FormData) {
  'use server';

  const channel = formData.get('channel')?.toString();
  const userId = formData.get('userId')?.toString();
  const enabledRaw = formData.get('enabled')?.toString();

  if (!channel || !userId || typeof enabledRaw === 'undefined') {
    return;
  }

  const enabled = enabledRaw === 'true';
  await lovedateApi.toggleNotification(channel, { userId, enabled });
  revalidatePath('/dashboard');
}

async function selectDiscoverModeAction(formData: FormData) {
  'use server';

  const userId = formData.get('userId')?.toString();
  const mode = formData.get('mode')?.toString();

  if (!userId || !mode || !isDiscoverMode(mode)) {
    return;
  }

  await lovedateApi.trackDiscoverEvent({
    userId,
    action: 'filter',
    filter: mode,
    surface: 'discover_filters',
  });

  redirect(`/dashboard?section=discover&discoverMode=${mode}#discover`);
}

async function trackDiscoverEventAction(formData: FormData) {
  'use server';

  const userId = formData.get('userId')?.toString();
  const action = formData.get('action')?.toString();

  if (!userId || !isDiscoverEventAction(action)) {
    return;
  }

  const payload: DiscoverEventPayload = {
    userId,
    action,
  };

  const cardUserId = formData.get('cardUserId')?.toString();
  if (cardUserId) {
    payload.cardUserId = cardUserId;
  }

  const filter = formData.get('filter')?.toString();
  if (isDiscoverMode(filter)) {
    payload.filter = filter;
  }

  const surface = formData.get('surface')?.toString();
  if (surface) {
    payload.surface = surface;
  }

  const latency = Number(formData.get('latencyMs'));
  if (!Number.isNaN(latency) && latency >= 0) {
    payload.latencyMs = latency;
  }

  await lovedateApi.trackDiscoverEvent(payload);
}

async function maybeTrackDiscoverEvent(
  formData: FormData,
  userId: string,
  fallbackCardUserId?: string
) {
  const telemetryAction = formData.get('telemetryAction')?.toString();
  if (!telemetryAction || !isDiscoverEventAction(telemetryAction)) {
    return;
  }

  const payload: DiscoverEventPayload = {
    userId,
    action: telemetryAction,
  };

  const formCardUserId = formData.get('telemetryCardUserId')?.toString();
  const cardUserId = formCardUserId || fallbackCardUserId;
  if (cardUserId) {
    payload.cardUserId = cardUserId;
  }

  const filter = formData.get('telemetryFilter')?.toString();
  if (filter && isDiscoverMode(filter)) {
    payload.filter = filter;
  }

  const surface = formData.get('telemetrySurface')?.toString();
  if (surface) {
    payload.surface = surface;
  }

  const latency = Number(formData.get('telemetryLatency'));
  if (!Number.isNaN(latency) && latency >= 0) {
    payload.latencyMs = latency;
  }

  await lovedateApi.trackDiscoverEvent(payload);
}

const serverActionRegistry = [
  applyLikeAction,
  nudgeLikeAction,
  toggleNotificationAction,
  selectDiscoverModeAction,
  trackDiscoverEventAction,
];
void serverActionRegistry;

export default async function DashboardPage(props: DashboardPageProps) {
  try {
    const resolvedParams = await Promise.resolve(props.searchParams ?? {});
    const session = getSession();
  const userId = resolvedParams?.userId ?? session?.userId ?? null;
  const sectionParam =
    typeof resolvedParams?.section === 'string' ? resolvedParams.section.toLowerCase() : 'home';
  const validSections: DashboardSection[] = ['home', 'discover', 'messages'];
  const activeSection = validSections.includes(sectionParam as DashboardSection)
    ? (sectionParam as DashboardSection)
    : 'home';
  const discoverModeParam =
    typeof resolvedParams?.discoverMode === 'string' ? resolvedParams.discoverMode : undefined;
  const discoverMode = isDiscoverMode(discoverModeParam) ? discoverModeParam : 'default';

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <h1 className="font-display text-3xl text-ink-900">Trust dashboard</h1>
          <p className="text-ink-700">
            You’re not signed in yet. Complete onboarding or re-open the matches page to generate a
            session.
          </p>
          <p className="text-sm text-ink-600">
            Once onboarding completes we store a secure cookie so you can return here without
            passing query params.
          </p>
          <PillButton asChild>
            <Link href="/onboarding">Return to onboarding</Link>
          </PillButton>
        </Card>
      </main>
    );
  }

  const [snapshot, engagement, discoverFeedResponse] = await Promise.all([
    loadSnapshot(userId),
    loadEngagementDashboard(userId),
    loadDiscoverFeed(userId, discoverMode, DISCOVER_FEED_LIMIT),
  ]);

  if (!snapshot || !snapshot.user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <h1 className="font-display text-3xl text-ink-900">Trust dashboard</h1>
          <p className="text-ink-700">
            We couldn’t load the trust center snapshot for this user yet.
          </p>
          <p className="text-sm text-ink-600">
            Give our identity service a few seconds, then refresh or re-run onboarding.
          </p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Retry onboarding</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/trust-center">View trust preview</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  const devicesTrusted = Array.isArray(snapshot.devices) ? snapshot.devices.length : 0;
  const verifiedLabel = snapshot.user?.isVerified ? 'Verified' : 'Pending review';
  const profileCompletionRaw =
    64 + (snapshot.user?.isVerified ? 18 : 0) + Math.min(12, devicesTrusted * 3);
  const profileCompletion = Math.min(98, Math.round(profileCompletionRaw));

  const matches = (await loadMatches(userId, 18)) ?? [];
  const fallbackDiscoverFeed = createDiscoverFeedFromCards(STATIC_DISCOVER_CARDS, discoverMode);
  const discoverFeed = normalizeDiscoverFeed(discoverFeedResponse, fallbackDiscoverFeed);
  const discoverCards = [discoverFeed.hero, ...discoverFeed.featured, ...discoverFeed.grid].filter(
    Boolean
  ) as DiscoverCard[];
  const discoverPeople = discoverCards.map((card) =>
    mapCardToDiscoverPerson(card, discoverFeed.mode)
  );
  const discoverFilters = discoverFeed.filters;

  const fallbackProfilePhoto =
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80';

  const formatOrientation = (orientation: string | undefined) =>
    orientation ? orientation.replace(/_/g, ' ') : 'Private';

  const formatDistance = (distanceKm?: number | null) => {
    if (typeof distanceKm !== 'number' || Number.isNaN(distanceKm)) {
      return undefined;
    }
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${Math.round(distanceKm)} km`;
  };

  const mapMatchToFeedProfile = (match: MatchCandidate): FeedProfile => {
    const prefs = Array.isArray(match.matchPreferences) ? match.matchPreferences : [];

    return {
      id: match.id,
      name: match.displayName,
      age: undefined,
      distance: formatDistance(match.distanceKm),
      location: match.cityRegion ? `${match.city} · ${match.cityRegion}` : match.city,
      orientation: formatOrientation(match.orientation),
      intent: prefs.includes('everyone')
        ? 'Open to everyone'
        : prefs.includes('women')
          ? 'Prefers women'
          : 'Prefers men',
      bio: match.bio ?? 'Prefers to reveal more in chat.',
      photo: (Array.isArray(match.photos) && match.photos[0]) ?? fallbackProfilePhoto,
      verified: match.isVerified,
      premiumOnly: false,
      interests: [
        match.discoverySpace === 'both'
          ? 'All vibes'
          : match.discoverySpace === 'lgbtq'
            ? 'LGBTQ+ orbit'
            : 'Straight orbit',
        `${match.compatibilityScore}% vibe`,
      ],
      receiverId: match.id,
      actionable: true,
    };
  };

  const liveFeedProfiles = matches.map(mapMatchToFeedProfile);

  const engagementFallback: EngagementDashboardResponse = {
    receivedLikes: engagement?.receivedLikes ?? [],
    sentLikes: engagement?.sentLikes ?? [],
    notificationPreferences: engagement?.notificationPreferences ?? [],
    premiumPerks: engagement?.premiumPerks ?? [],
    safetyResources: engagement?.safetyResources ?? [],
    settingsShortcuts: engagement?.settingsShortcuts ?? [],
    discoverFilters: engagement?.discoverFilters ?? [],
  };

  const likesGiven: LikePerson[] = (engagementFallback.sentLikes ?? []).map((like) => ({
    id: like.id,
    likeEdgeId: like.id,
    name: like.name,
    age: like.age,
    city: like.city,
    distance: like.distance,
    tags: like.tags,
    highlight: like.highlight,
    image: like.image,
    premiumOnly: like.premiumOnly,
    verified: like.verified ?? false,
  }));

  const profilePhotos = Array.isArray((snapshot as any)?.user?.photos)
    ? ((snapshot as any).user.photos as string[])
    : [];

  const verificationTimeline: { title: string; helper: string; status: 'done' | 'pending' }[] = [
    {
      title: 'Photo verification',
      helper: snapshot.user?.isVerified ? 'Completed' : 'Pending selfie check',
      status: snapshot.user?.isVerified ? 'done' : 'pending',
    },
    {
      title: 'ID verification',
      helper: 'Optional boost to trust tier',
      status: 'pending',
    },
    {
      title: 'Community guidelines',
      helper: 'No flags on record',
      status: 'done',
    },
  ];

  const feedProfiles: FeedProfile[] = liveFeedProfiles.length
    ? liveFeedProfiles.slice(0, 6)
    : ([
        {
          id: 'marco',
          name: 'Marco',
          age: 31,
          distance: '4 mi',
          location: 'Williamsburg · Brooklyn',
          orientation: 'Pansexual · He/Him',
          intent: 'Looking for long-term',
          bio: 'Creative director into rooftop jazz nights, mezcal tastings, and sunrise runs over the bridge.',
          photo:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
          verified: true,
          interests: ['Design', 'Travel', 'Jazz clubs'],
        },
        {
          id: 'ivy',
          name: 'Ivy',
          age: 28,
          distance: '2 mi',
          location: 'SoHo · Manhattan',
          orientation: 'Queer · She/They',
          intent: 'Dating thoughtfully',
          bio: 'Ceramicist + gallery consultant. Planning a Lisbon sabbatical—need a partner-in-curiosity.',
          photo:
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
          verified: true,
          premiumOnly: true,
          interests: ['Art walks', 'Matcha', 'Analog photography'],
        },
        {
          id: 'amir',
          name: 'Amir',
          age: 33,
          distance: '7 mi',
          location: 'Long Island City',
          orientation: 'Straight · He/Him',
          intent: 'Exploring connections',
          bio: 'Product manager building climate tools. Loves bouldering, dumpling tours, and human design chats.',
          photo:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
          verified: false,
          interests: ['Outdoors', 'Tech ethics', 'Foodie'],
        },
        {
          id: 'sasha',
          name: 'Sasha',
          age: 26,
          city: 'Williamsburg',
          distance: '6 mi',
          tags: ['Wellness', 'Foodie'],
          highlight: 'Shared a playlist',
          image:
            'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80',
          verified: false,
          interests: ['Wellness', 'Foodie'],
        },
      ] as FeedProfile[]);

  const likesYou: LikePerson[] = engagementFallback.receivedLikes.length
    ? engagementFallback.receivedLikes.map((like) => ({
        id: like.id,
        likeEdgeId: like.id,
        name: like.name,
        age: like.age,
        city: like.city,
        distance: like.distance,
        tags: like.tags,
        highlight: like.highlight,
        image: like.image,
        premiumOnly: like.premiumOnly,
        verified: like.verified ?? false,
      }))
    : [
        {
          id: 'maya',
          name: 'Maya',
          age: 27,
          city: 'Midtown',
          distance: '2 mi',
          tags: ['Jazz', 'Poetry'],
          highlight: 'Sent a compliment',
          image:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
          verified: true,
        },
        {
          id: 'sasha',
          name: 'Sasha',
          age: 26,
          city: 'Williamsburg',
          distance: '6 mi',
          tags: ['Wellness', 'Foodie'],
          highlight: 'Shared a playlist',
          image:
            'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80',
          verified: false,
        },
      ];

  const messageThreads = await loadMessagingThreads(userId);

  const unreadCount = messageThreads.reduce((sum, thread) => sum + (thread.unread ?? 0), 0);

  const navItems: NavItem[] = [
    { label: 'Home', icon: Sparkles, href: '/dashboard?section=home#top', section: 'home' },
    {
      label: 'Discover',
      icon: Compass,
      href: '/dashboard?section=discover#discover',
      section: 'discover',
    },
    { label: 'Matches', icon: Heart, badge: '9', href: '/matches' },
    { label: 'Moments', icon: Star, href: '/dashboard?section=home#top' },
    {
      label: 'Messages',
      icon: MessageCircle,
      badge: unreadCount ? `${unreadCount}` : undefined,
      href: '/dashboard?section=messages#messages',
      section: 'messages',
    },
    { label: 'Communities', icon: Users, href: '/dashboard?section=discover#discover' },
    { label: 'Safety Center', icon: ShieldCheck, href: '/trust-center' },
    { label: 'Settings', icon: Settings, href: '/settings/profile' },
  ];

  const matchPreviews: MatchPreview[] = [
    {
      name: 'Sarah',
      compatibility: 'New match · 5m',
      highlight: 'Artist Alley • Verified',
      status: 'Start chat',
      accent: 'from-[#fef3f2] to-[#fde7f5]',
      avatar:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'David',
      compatibility: 'Active 27m ago',
      highlight: 'New to the city',
      status: 'Start chat',
      accent: 'from-[#e0f2ff] to-[#f0f7ff]',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Kayla',
      compatibility: 'Online now',
      highlight: 'Vegan foodie, loves travel',
      status: 'Wave hello',
      accent: 'from-[#fef6d3] to-[#fff8ec]',
      avatar:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const matchCandidates: MatchCandidatePreview[] = matches.length
    ? matches.slice(0, 4).map((match, index) => ({
        id: match.id,
        name: match.displayName,
        status: index === 0 ? 'new' : index === 1 ? 'active' : 'expiring',
        highlight: match.city ?? 'Ready to connect',
        compatibility: match.compatibilityScore,
        avatar:
          (Array.isArray(match.photos) && match.photos[0]) ??
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
        verified: match.isVerified,
      }))
    : [
        {
          id: 'liv',
          name: 'Liv',
          status: 'new',
          highlight: 'Met at Hidden City supper club',
          compatibility: 92,
          avatar:
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
          verified: true,
        },
        {
          id: 'noah',
          name: 'Noah',
          status: 'active',
          highlight: 'Chatting about gallery openings',
          compatibility: 84,
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'talia',
          name: 'Talia',
          status: 'expiring',
          highlight: 'Reply in 12h to keep the vibe',
          compatibility: 77,
          avatar:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
          verified: true,
        },
      ];

  const notificationToggles: NotificationToggle[] = engagementFallback.notificationPreferences
    .length
    ? engagementFallback.notificationPreferences
    : [
        {
          channel: 'push',
          label: 'Push notifications',
          helper: 'Instant match + message alerts',
          enabled: true,
        },
        {
          channel: 'email',
          label: 'Email recaps',
          helper: 'Daily digest of likes + invites',
          enabled: false,
        },
        { channel: 'quiet', label: 'Quiet hours', helper: 'Mute alerts 10pm-8am', enabled: true },
      ];

  const premiumPerks: PremiumPerk[] = engagementFallback.premiumPerks.length
    ? engagementFallback.premiumPerks
    : [
        { title: 'Boost your profile', helper: 'Top of feeds for 60 minutes', cta: 'Boost now' },
        { title: 'See who liked you', helper: 'Instant match with admirers', cta: 'View likes' },
        {
          title: 'Advanced filters',
          helper: 'Height, lifestyle, intent controls',
          cta: 'Unlock filters',
        },
      ];

  const safetyResources: SafetyResource[] = engagementFallback.safetyResources.length
    ? engagementFallback.safetyResources
    : [
        { title: 'Report a profile', helper: 'Flag suspicious behavior', href: '/support/report' },
        { title: 'Blocked users', helper: 'Manage who can contact you', href: '/settings/blocked' },
        {
          title: 'Safety playbook',
          helper: 'Tips curated by our trust team',
          href: '/support/safety',
        },
      ];

  const settingItems: SettingItem[] = engagementFallback.settingsShortcuts.length
    ? engagementFallback.settingsShortcuts.map((item) => ({
        label: item.label,
        helper: item.helper,
        href: item.href,
        tone: item.tone ?? 'default',
      }))
    : [
        { label: 'Account details', helper: 'Name, email, phone', href: '/settings/profile' },
        {
          label: 'Password & security',
          helper: 'Passcodes, devices, MFA',
          href: '/settings/security',
        },
        {
          label: 'Privacy & visibility',
          helper: 'Discovery space, distance',
          href: '/settings/privacy',
        },
        {
          label: 'Pause account',
          helper: 'Take a break without losing matches',
          href: '/settings/pause',
        },
        {
          label: 'Delete account',
          helper: 'Remove data permanently',
          href: '/settings/delete',
          tone: 'danger',
        },
      ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-20 pt-10" id="top">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 sm:px-6 lg:px-10">
        <SidebarNav items={navItems} activeSection={activeSection} />

        <div className="flex-1 space-y-8">
          <section className="space-y-6" id="home">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">Home feed</p>
                <h2 className="text-2xl font-semibold text-[#0f172a]">Curated for your orbit</h2>
                <p className="text-sm text-[#94a3b8]">
                  Discovery respects your orientation, intent, and privacy preferences.
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-white/80 px-3 py-1 text-[#475569]">
                  Verified orbit
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-[#475569]">
                  Trust score {snapshot.user?.trustScore ?? 0}
                </span>
              </div>
            </div>
            <HomeFeed profiles={feedProfiles} senderId={userId} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.8fr,1fr]" id="overview">
            <Card className="space-y-6 border-none bg-gradient-to-br from-[#fff5fb] via-[#fff0f6] to-white p-8 shadow-[0_30px_80px_rgba(21,33,76,0.10)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#6b7280]">Welcome back,</p>
                  <h1 className="mt-1 hero-title text-[#0f172a]">
                    <span className="inline-block truncate"><span className="gradient-clip">{snapshot.user?.displayName ?? userId}</span></span>
                    <span className="ml-3 inline-block gradient-clip">👋</span>
                  </h1>
                  <p className="mt-2 text-sm text-[#94a3b8]">
                    You have <span className="font-semibold gradient-clip">{matches.length}</span> matches and{' '}
                    <span className="font-semibold gradient-clip">{unreadCount}</span> unread messages
                  </p>
                </div>

                <div>
                  <HeroStatsClient
                    userId={userId}
                    initialMatches={matches.length}
                    initialChats={messageThreads.length}
                    initialProfileViews={snapshot.user?.profileViews ?? 156}
                  />
                </div>
              </div>
            </Card>

            <div id="messages">
              <RightRail matches={matchPreviews} messages={messageThreads} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
            <div id="discover" className="space-y-5">
              <DiscoverFilters
                filters={discoverFilters}
                activeMode={discoverFeed.mode}
                userId={userId}
              />
              <DiscoverGrid people={discoverPeople} senderId={userId} mode={discoverFeed.mode} />
            </div>
            <div id="likes">
              <LikesPanel likes={likesYou} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2" id="profile">
            <ProfileManager
              completion={profileCompletion}
              photos={profilePhotos}
              trustScore={snapshot.user?.trustScore ?? 0}
              verified={snapshot.user?.isVerified ?? false}
            />
            <VerificationPanel timeline={verificationTimeline} verifiedLabel={verifiedLabel} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2" id="likes-inbox">
            <LikesSplitPanel received={likesYou} sent={likesGiven} />
            <MessagesInbox threads={messageThreads} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2" id="matches">
            <MatchesPanel candidates={matchCandidates} />
            <NotificationsPanel toggles={notificationToggles} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2" id="premium">
            <PremiumPanel perks={premiumPerks} />
            <SafetySupportPanel resources={safetyResources} />
          </section>

          <section id="settings">
            <SettingsPanel items={settingItems} />
          </section>
        </div>
      </div>
    </main>
  );
  } catch (err) {
    console.error('Dashboard server render error', err);

    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <h1 className="font-display text-3xl text-ink-900">Trust dashboard</h1>
          <p className="text-ink-700">An unexpected error occurred while rendering the dashboard. Please refresh or try again later.</p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Return to onboarding</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }
}

function SidebarNav({
  items,
  activeSection,
}: {
  items: NavItem[];
  activeSection: DashboardSection;
}) {
  return (
    <aside className={`hidden w-[230px] lg:block ${sidebarFont.className}`}>
      <div className="sticky top-6 space-y-6">
        <Card className="space-y-6 border-none bg-white p-6 shadow-[0_20px_60px_rgba(18,24,40,0.08)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#8f63ff] to-[#ff79c6] px-3 py-2 text-base font-semibold text-white">
              AV
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#0f172a]">AmoraVibe</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
                Stay in your orbit
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[0.95rem] font-medium transition ${
                  item.section && item.section === activeSection
                    ? 'bg-gradient-to-br from-[#8f63ff] to-[#ff79c6] text-white shadow-sm'
                    : 'text-[#475569] hover:bg-[#f8fafc]'
                }`}
                aria-current={item.section && item.section === activeSection ? 'page' : undefined}
              >
                <span className="inline-flex items-center gap-3">
                  {React.createElement(item.icon, {
                    className: `$
                      item.section && item.section === activeSection
                        ? 'text-white'
                        : 'text-[#cbd5f5]'
                    } size-4`
                  })}
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4338ca] shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
          <div className="rounded-2xl bg-[#f8fafc] p-4 text-sm text-[#475569]">
            <p className="text-base font-semibold tracking-tight text-[#0f172a]">Safety center</p>
            <p className="text-xs uppercase tracking-[0.25em] text-[#94a3b8]">
              Verification & trust
            </p>
            <Link
              href="/trust-center"
              className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.25em] text-[#4338ca]"
            >
              Open trust hub →
            </Link>
          </div>
        </Card>
      </div>
    </aside>
  );
}

function DiscoverGrid({
  people,
  senderId,
  mode,
}: {
  people: DiscoverPerson[];
  senderId?: string;
  mode: DiscoverFeedMode;
}) {
  return (
    <Card className="space-y-5 border-none bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#0f172a]">Discover new people</h2>
          <p className="text-sm text-[#94a3b8]">Curated for your vibe</p>
        </div>
        <form
          action="/matches"
          method="get"
          className="flex items-center gap-3"
          aria-label="Search discovery matches"
        >
          <input
            type="search"
            name="q"
            placeholder="Search people/interests"
            className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm text-[#0f172a] focus:border-[#6366f1] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
          <Link
            href="/matches?view=filters"
            className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#4338ca]"
          >
            Filters
          </Link>
        </form>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <DiscoverCard key={person.id} person={person} senderId={senderId} mode={mode} />
        ))}
      </div>
    </Card>
  );
}

function DiscoverCard({
  person,
  senderId,
  mode,
}: {
  person: DiscoverPerson;
  senderId?: string;
  mode: DiscoverFeedMode;
}) {
  const cardUserId = person.receiverId ?? person.id;
  const filterMode = person.mode ?? mode;

  return (
    <div className="rounded-3xl border border-[#eef2ff] bg-white shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
        <Image
          src={person.image}
          alt={person.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
        {person.compatibility ? (
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#8f63ff] to-[#ff79c6] px-3 py-1 text-xs font-bold text-white shadow-sm">
            {person.compatibility}% match
          </div>
        ) : null}
        {person.compatibility && person.compatibility >= 90 ? (
          <div className="absolute top-3 right-3 rounded-full bg-[#fef3f2] px-2 py-1 text-xs font-semibold text-[#b91c1c]">
            New
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {person.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-white/30 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2 px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-[#0f172a]">
            {person.name}, {person.age}
          </p>
          <span className="text-sm text-[#94a3b8]">{person.distance}</span>
        </div>
        <p className="text-sm text-[#64748b]">{person.city}</p>
        <div className="flex flex-wrap gap-2 text-xs text-[#6366f1]">
          {person.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#eef2ff] px-2 py-1">
              #{tag.toLowerCase()}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          <LikeActionButton
            senderId={senderId}
            receiverId={person.receiverId}
            action="like"
            highlight={`Discovery hi to ${person.name}`}
            className="flex-1 rounded-full bg-[#4338ca] px-4 py-2 text-center text-sm font-semibold text-white"
            disabled={!person.actionable}
            telemetry={{
              action: 'like',
              cardUserId,
              filter: filterMode,
              surface: 'discover_grid',
            }}
          >
            Say hi
          </LikeActionButton>
          <LikeActionButton
            senderId={senderId}
            receiverId={person.receiverId}
            action="save"
            highlight={`Saved discovery profile ${person.name}`}
            className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#4338ca]"
            disabled={!person.actionable}
            telemetry={{
              action: 'save',
              cardUserId,
              filter: filterMode,
              surface: 'discover_grid',
            }}
          >
            Save
          </LikeActionButton>
          <LikeActionButton
            senderId={senderId}
            receiverId={person.receiverId}
            action="pass"
            highlight={`Passed on ${person.name}`}
            className="rounded-full border border-[#fee2e2] px-4 py-2 text-sm font-semibold text-[#b91c1c]"
            disabled={!person.actionable}
            telemetry={{
              action: 'pass',
              cardUserId,
              filter: filterMode,
              surface: 'discover_grid',
            }}
            pendingLabel="Passing…"
          >
            Pass
          </LikeActionButton>
        </div>
        {senderId ? (
          <div className="flex flex-wrap gap-2 pt-3 text-sm">
            <form action={trackDiscoverEventAction} className="flex-1">
              <input type="hidden" name="userId" value={senderId} />
              <input type="hidden" name="action" value="view" />
              <input type="hidden" name="cardUserId" value={cardUserId} />
              <input type="hidden" name="filter" value={filterMode} />
              <input type="hidden" name="surface" value="discover_grid" />
              <LikeActionSubmitButton className="w-full rounded-full border border-[#e2e8f0] px-4 py-2 font-semibold text-[#0f172a]">
                View profile
              </LikeActionSubmitButton>
            </form>
            <form action={trackDiscoverEventAction} className="flex-1">
              <input type="hidden" name="userId" value={senderId} />
              <input type="hidden" name="action" value="dismiss" />
              <input type="hidden" name="cardUserId" value={cardUserId} />
              <input type="hidden" name="filter" value={filterMode} />
              <input type="hidden" name="surface" value="discover_grid" />
              <LikeActionSubmitButton className="w-full rounded-full border border-[#ffe4e6] px-4 py-2 font-semibold text-[#be123c]">
                Dismiss
              </LikeActionSubmitButton>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LikesPanel({ likes }: { likes: LikePerson[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#0f172a]">Likes you</h3>
          <p className="text-sm text-[#94a3b8]">Send a quick wave back</p>
        </div>
        <Link
          href="/matches?view=likes"
          className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#4338ca]"
        >
          See all
        </Link>
      </header>
      <div className="space-y-3">
        {likes.map((like) => (
          <LikeCard key={like.id} like={like} />
        ))}
      </div>
    </Card>
  );
}

function LikeCard({ like }: { like: LikePerson }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#eef2ff] p-3">
      <Image
        src={like.image}
        alt={like.name}
        width={56}
        height={56}
        loading="lazy"
        className="h-14 w-14 rounded-2xl object-cover"
      />
      <div className="flex-1">
        <p className="text-base font-semibold text-[#0f172a]">
          {like.name}, {like.age}
        </p>
        {like.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ea5e9]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0ea5e9]" /> Verified
          </span>
        ) : null}
        <p className="text-sm text-[#94a3b8]">{like.highlight}</p>
        <div className="text-xs text-[#6366f1]">{like.tags.join(' • ')}</div>
      </div>
      <Link
        href={`/matches?highlight=${encodeURIComponent(like.id)}`}
        className="rounded-full bg-[#fef3f2] px-4 py-2 text-sm font-semibold text-[#f43f5e]"
      >
        View
      </Link>
    </div>
  );
}

function RightRail({
  matches,
  messages,
}: {
  matches: MatchPreview[];
  messages: MessagingThread[];
}) {
  return (
    <div className="space-y-5">
      <Card
        id="matches-rail"
        className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]"
      >
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a]">New matches</h3>
            <p className="text-sm text-[#94a3b8]">Start conversations faster</p>
          </div>
          <Link href="/matches" className="text-sm font-semibold text-[#4338ca]">
            See all
          </Link>
        </header>
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchSnippet key={match.name} match={match} />
          ))}
        </div>
      </Card>

      <Card
        id="messages-rail"
        className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]"
      >
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a]">Messages</h3>
            <p className="text-sm text-[#94a3b8]">Keep the spark alive</p>
          </div>
          <Link
            href="/dashboard?section=messages#messages"
            className="text-sm font-semibold text-[#4338ca]"
          >
            View inbox
          </Link>
        </header>
        <div className="space-y-3">
          {messages.map((thread) => (
            <MessageSnippet key={thread.id} thread={thread} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function MatchSnippet({ match }: { match: MatchPreview }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-[#eef2ff] bg-gradient-to-r ${match.accent} p-3`}
    >
      <Image
        src={match.avatar}
        alt={match.name}
        width={48}
        height={48}
        loading="lazy"
        className="h-12 w-12 rounded-2xl object-cover"
      />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0f172a]">{match.name}</p>
        <p className="text-xs text-[#475569]">{match.highlight}</p>
        <p className="text-xs text-[#94a3b8]">{match.compatibility}</p>
      </div>
      <Link
        href={`/matches?highlight=${encodeURIComponent(match.name)}`}
        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338ca] shadow-sm"
      >
        {match.status}
      </Link>
    </div>
  );
}

function MessageSnippet({ thread }: { thread: MessagingThread }) {
  const toneStyles = STATUS_TONE_STYLES[thread.status.tone];
  return (
    <Link
      href={thread.route}
      className="flex items-start gap-3 rounded-2xl border border-[#eef2ff] p-3"
    >
      <Image
        src={thread.avatar}
        alt={thread.name}
        width={44}
        height={44}
        loading="lazy"
        className="h-11 w-11 rounded-2xl object-cover"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#0f172a]">{thread.name}</p>
          <span className="text-xs text-[#94a3b8]">{thread.lastActive}</span>
        </div>
        <p className="text-xs text-[#475569]">{thread.snippet}</p>
        <p className="text-xs text-[#94a3b8]">{thread.vibeLine}</p>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${toneStyles.pill}`}
        >
          <span className={`h-2 w-2 rounded-full ${toneStyles.dot}`} />
          {thread.status.label}
        </span>
      </div>
      {thread.unread && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f43f5e] text-[11px] font-semibold text-white">
          {thread.unread}
        </span>
      )}
    </Link>
  );
}
