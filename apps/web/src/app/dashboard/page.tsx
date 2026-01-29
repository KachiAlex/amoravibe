import { Card, PillButton } from '@lovedate/ui';
import Link from 'next/link';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';
import {
  Compass,
  Heart,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { TrustCenterSnapshotResponse } from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import { getSession } from '@/lib/session';

const sidebarFont = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600'] });

type IconType = ComponentType<{ className?: string }>;

interface NavItem {
  label: string;
  icon: IconType;
  badge?: string;
  active?: boolean;
}

interface DiscoverPerson {
  id: string;
  name: string;
  age: number;
  city: string;
  distance: string;
  tags: string[];
  image: string;
}

interface LikePerson extends DiscoverPerson {
  highlight: string;
}

interface MatchPreview {
  name: string;
  compatibility: string;
  highlight: string;
  status: string;
  accent: string;
  avatar: string;
}

interface MessageThread {
  name: string;
  snippet: string;
  lastActive: string;
  unread?: number;
  avatar: string;
}

interface DashboardPageProps {
  searchParams?: Promise<{ userId?: string }> | { userId?: string };
}

async function loadSnapshot(userId: string): Promise<TrustCenterSnapshotResponse | null> {
  try {
    return await lovedateApi.fetchTrustSnapshot(userId);
  } catch (error) {
    console.error('Failed to load trust snapshot', error);
    return null;
  }
}

export default async function DashboardPage(props: DashboardPageProps) {
  const resolvedParams = await Promise.resolve(props.searchParams ?? {});
  const session = getSession();
  const userId = resolvedParams?.userId ?? session?.userId ?? null;

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

  const snapshot = await loadSnapshot(userId);

  if (!snapshot) {
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

  const devicesTrusted = snapshot.devices.length;
  const verifiedLabel = snapshot.user.isVerified ? 'Verified' : 'Pending review';
  const profileCompletionRaw =
    64 + (snapshot.user.isVerified ? 18 : 0) + Math.min(12, devicesTrusted * 3);
  const profileCompletion = Math.min(98, Math.round(profileCompletionRaw));

  const discoverPeople: DiscoverPerson[] = [
    {
      id: 'peter',
      name: 'Peter',
      age: 29,
      city: 'Brooklyn, NY',
      distance: '3 mi',
      tags: ['Travel', 'Photography', 'Dogs'],
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'chloe',
      name: 'Chloe',
      age: 25,
      city: 'SoHo, NY',
      distance: '5 mi',
      tags: ['Art', 'Ceramics'],
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'aaron',
      name: 'Aaron',
      age: 32,
      city: 'Chelsea, NY',
      distance: '8 mi',
      tags: ['Galleries', 'Running'],
      image:
        'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const likesYou: LikePerson[] = [
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
    },
  ];

  const messageThreads: MessageThread[] = [
    {
      name: 'Sarah',
      snippet: 'Loved your take on rooftop vinyl nights.',
      lastActive: '5m ago',
      unread: 1,
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'David',
      snippet: 'Ready for the gallery hop later?',
      lastActive: '27m ago',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Kayla',
      snippet: 'Just sent over café options ☕️',
      lastActive: '1h ago',
      avatar:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const unreadCount = messageThreads.reduce((sum, thread) => sum + (thread.unread ?? 0), 0);

  const navItems: NavItem[] = [
    { label: 'Home', icon: Sparkles, active: true },
    { label: 'Discover', icon: Compass },
    { label: 'Matches', icon: Heart, badge: '9' },
    { label: 'Moments', icon: Star },
    { label: 'Messages', icon: MessageCircle, badge: unreadCount ? `${unreadCount}` : undefined },
    { label: 'Communities', icon: Users },
    { label: 'Safety Center', icon: ShieldCheck },
    { label: 'Settings', icon: Settings },
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

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-20 pt-10">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 sm:px-6 lg:px-10">
        <SidebarNav items={navItems} />

        <div className="flex-1 space-y-8">
          <section className="grid gap-6 xl:grid-cols-[1.8fr,1fr]">
            <Card className="space-y-6 border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(21,33,76,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">Welcome back</p>
                  <h1 className="mt-1 text-3xl font-semibold text-[#0f172a]">
                    {snapshot.user.displayName}, explore your orbit
                  </h1>
                  <p className="text-sm text-[#94a3b8]">
                    Profile strength {profileCompletion}% complete
                  </p>
                </div>
                <button className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-medium text-[#4338ca] shadow-sm">
                  Edit profile
                </button>
              </div>

              <div className="space-y-3 rounded-2xl bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between text-sm text-[#475569]">
                  <span>Profile progress</span>
                  <span className="font-semibold text-[#0f172a]">{profileCompletion}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8f63ff] via-[#ff79c6] to-[#ffb347]"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#f1f5f9] bg-white p-4">
                  <p className="text-sm font-medium text-[#475569]">Next experience</p>
                  <p className="text-lg font-semibold text-[#0f172a]">Gallery crawl tonight</p>
                  <p className="text-sm text-[#94a3b8]">Invite your best matches</p>
                </div>
                <div className="rounded-2xl border border-[#f1f5f9] bg-white p-4">
                  <p className="text-sm font-medium text-[#475569]">Safety pulse</p>
                  <p className="text-lg font-semibold text-[#0f172a]">
                    Verification {verifiedLabel.toLowerCase()}
                  </p>
                  <button className="mt-3 rounded-full border border-[#d0d7ff] px-4 py-2 text-sm font-medium text-[#4338ca]">
                    Review status
                  </button>
                </div>
              </div>
            </Card>

            <RightRail matches={matchPreviews} messages={messageThreads} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
            <DiscoverGrid people={discoverPeople} />
            <LikesPanel likes={likesYou} />
          </section>
        </div>
      </div>
    </main>
  );
}

function SidebarNav({ items }: { items: NavItem[] }) {
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
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[0.95rem] font-medium transition ${
                  item.active ? 'bg-[#eef2ff] text-[#312e81]' : 'text-[#475569] hover:bg-[#f8fafc]'
                }`}
              >
                <span className="inline-flex items-center gap-3">
                  <item.icon
                    className={`${item.active ? 'text-[#5b21b6]' : 'text-[#cbd5f5]'} size-4`}
                  />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4338ca] shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
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

function DiscoverGrid({ people }: { people: DiscoverPerson[] }) {
  return (
    <Card className="space-y-5 border-none bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#0f172a]">Discover new people</h2>
          <p className="text-sm text-[#94a3b8]">Curated for your vibe</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search people/interests"
            className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm text-[#0f172a] focus:border-[#6366f1] focus:outline-none"
          />
          <button className="rounded-full bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white">
            Filters
          </button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <DiscoverCard key={person.id} person={person} />
        ))}
      </div>
    </Card>
  );
}

function DiscoverCard({ person }: { person: DiscoverPerson }) {
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
          <button className="flex-1 rounded-full bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white">
            Say hi
          </button>
          <button className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#4338ca]">
            Save
          </button>
        </div>
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
        <button className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#4338ca]">
          See all
        </button>
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
        <p className="text-sm text-[#94a3b8]">{like.highlight}</p>
        <div className="text-xs text-[#6366f1]">{like.tags.join(' • ')}</div>
      </div>
      <button className="rounded-full bg-[#fef3f2] px-4 py-2 text-sm font-semibold text-[#f43f5e]">
        View
      </button>
    </div>
  );
}

function RightRail({ matches, messages }: { matches: MatchPreview[]; messages: MessageThread[] }) {
  return (
    <div className="space-y-5">
      <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a]">New matches</h3>
            <p className="text-sm text-[#94a3b8]">Start conversations faster</p>
          </div>
          <button className="text-sm font-semibold text-[#4338ca]">See all</button>
        </header>
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchSnippet key={match.name} match={match} />
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a]">Messages</h3>
            <p className="text-sm text-[#94a3b8]">Keep the spark alive</p>
          </div>
          <button className="text-sm font-semibold text-[#4338ca]">View inbox</button>
        </header>
        <div className="space-y-3">
          {messages.map((thread) => (
            <MessageSnippet key={thread.name} thread={thread} />
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
      <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338ca] shadow-sm">
        {match.status}
      </button>
    </div>
  );
}

function MessageSnippet({ thread }: { thread: MessageThread }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#eef2ff] p-3">
      <Image
        src={thread.avatar}
        alt={thread.name}
        width={44}
        height={44}
        loading="lazy"
        className="h-11 w-11 rounded-2xl object-cover"
      />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0f172a]">{thread.name}</p>
        <p className="text-xs text-[#475569]">{thread.snippet}</p>
      </div>
      <div className="text-right text-xs text-[#94a3b8]">
        <p>{thread.lastActive}</p>
        {thread.unread ? (
          <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f43f5e] text-[11px] font-semibold text-white">
            {thread.unread}
          </span>
        ) : null}
      </div>
    </div>
  );
}
