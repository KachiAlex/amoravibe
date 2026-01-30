import { Card, PillButton } from '@lovedate/ui';
import Link from 'next/link';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';
import { revalidatePath } from 'next/cache';
import {
  Compass,
  Heart,
  Lock,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type {
  EngagementDashboardResponse,
  LikeActionType,
  MatchCandidate,
  TrustCenterSnapshotResponse,
} from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import { getSession } from '@/lib/session';
import type { MessagingThread as MessageThread } from '@/lib/messaging';
import { loadLocalThreads } from '@/lib/messaging';

const sidebarFont = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600'] });

type IconType = ComponentType<{ className?: string }>;

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

function MessagesInbox({ threads }: { threads: MessageThread[] }) {
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
      <div className="space-y-3">
        {threads.map((thread) => (
          <Link
            key={thread.name}
            href={`/messages/${encodeURIComponent(thread.name.toLowerCase())}`}
            className="flex items-center gap-3 rounded-2xl border border-[#eef2ff] p-3 hover:border-[#cbd5f5]"
          >
            <Image
              src={thread.avatar}
              alt={thread.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl object-cover"
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
          </Link>
        ))}
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
              <p className="text-xs text-[#94a3b8]">{candidate.compatibility}% vibe match</p>
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
            <Lock className="mb-2 h-6 w-6" />
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

function DiscoverFilters({ filters }: { filters: DiscoverFilter[] }) {
  return (
    <Card className="space-y-4 border-none bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-sm font-medium text-[#6b7280]">Explore modes</p>
        <h3 className="text-xl font-semibold text-[#0f172a]">Tune your discovery lane</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              filter.premium
                ? 'border-[#fcd34d] bg-[#fffbeb]'
                : 'border-[#e2e8f0] hover:border-[#cbd5f5]'
            }`}
          >
            <span>
              <p className="text-sm font-semibold text-[#0f172a]">{filter.label}</p>
              <p className="text-xs text-[#94a3b8]">{filter.helper}</p>
            </span>
            {filter.premium ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#b45309]">
                <Lock className="h-3 w-3" /> Premium
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </Card>
  );
}

interface DiscoverPerson {
  id: string;
  name: string;
  age?: number;
  city?: string;
  distance?: string;
  tags: string[];
  image: string;
  receiverId?: string;
  actionable?: boolean;
}

function LikeActionButton({
  senderId,
  receiverId,
  action,
  highlight,
  children,
  className,
  disabled,
}: {
  senderId?: string | null;
  receiverId?: string;
  action: LikeActionType;
  highlight?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  if (!senderId || !receiverId) {
    return (
      <button type="button" className={className} disabled>
        {children}
      </button>
    );
  }

  return (
    <form action={applyLikeAction} className="flex-1">
      <input type="hidden" name="senderId" value={senderId} />
      <input type="hidden" name="receiverId" value={receiverId} />
      <input type="hidden" name="action" value={action} />
      {highlight ? <input type="hidden" name="highlight" value={highlight} /> : null}
      <button type="submit" className={className} disabled={disabled}>
        {children}
      </button>
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

interface DiscoverFilter {
  label: string;
  helper: string;
  premium?: boolean;
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
    | Promise<{ userId?: string; section?: string }>
    | { userId?: string; section?: string };
}

async function loadSnapshot(userId: string): Promise<TrustCenterSnapshotResponse | null> {
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

const serverActionRegistry = [applyLikeAction, nudgeLikeAction, toggleNotificationAction];
void serverActionRegistry;

export default async function DashboardPage(props: DashboardPageProps) {
  const resolvedParams = await Promise.resolve(props.searchParams ?? {});
  const session = getSession();
  const userId = resolvedParams?.userId ?? session?.userId ?? null;
  const sectionParam =
    typeof resolvedParams?.section === 'string' ? resolvedParams.section.toLowerCase() : 'home';
  const validSections: DashboardSection[] = ['home', 'discover', 'messages'];
  const activeSection = validSections.includes(sectionParam as DashboardSection)
    ? (sectionParam as DashboardSection)
    : 'home';

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

  const [snapshot, engagement] = await Promise.all([
    loadSnapshot(userId),
    loadEngagementDashboard(userId),
  ]);

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

  const matches = (await loadMatches(userId, 18)) ?? [];

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

  const mapMatchToFeedProfile = (match: MatchCandidate): FeedProfile => ({
    id: match.id,
    name: match.displayName,
    age: undefined,
    distance: formatDistance(match.distanceKm),
    location: match.cityRegion ? `${match.city} · ${match.cityRegion}` : match.city,
    orientation: formatOrientation(match.orientation),
    intent: match.matchPreferences.includes('everyone')
      ? 'Open to everyone'
      : match.matchPreferences.includes('women')
        ? 'Prefers women'
        : 'Prefers men',
    bio: match.bio ?? 'Prefers to reveal more in chat.',
    photo: match.photos[0] ?? fallbackProfilePhoto,
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
  });

  const mapMatchToDiscoverPerson = (match: MatchCandidate): DiscoverPerson => ({
    id: match.id,
    name: match.displayName,
    age: undefined,
    city: match.cityRegion ? `${match.city} · ${match.cityRegion}` : match.city,
    distance: formatDistance(match.distanceKm),
    tags: [
      formatOrientation(match.orientation),
      match.discoverySpace === 'both'
        ? 'All vibes'
        : match.discoverySpace === 'lgbtq'
          ? 'LGBTQ+'
          : 'Straight orbit',
      `${match.compatibilityScore}% vibe`,
    ].filter(Boolean),
    image: match.photos[0] ?? fallbackProfilePhoto,
    receiverId: match.id,
    actionable: true,
  });

  const liveFeedProfiles = matches.map(mapMatchToFeedProfile);
  const liveDiscoverPeople = matches.map(mapMatchToDiscoverPerson);

  const engagementFallback: EngagementDashboardResponse = engagement ?? {
    receivedLikes: [],
    sentLikes: [],
    notificationPreferences: [],
    premiumPerks: [],
    safetyResources: [],
    settingsShortcuts: [],
    discoverFilters: [],
  };

  const discoverPeople: DiscoverPerson[] = liveDiscoverPeople.length
    ? liveDiscoverPeople.slice(0, 9)
    : [
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
          city: 'Lower East Side, NY',
          distance: '1 mi',
          tags: ['Coffee shops', 'Film festivals'],
          image:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        },
      ];

  const likesGiven: LikePerson[] = engagementFallback.sentLikes.map((like) => ({
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
  }));

  const profilePhotos = Array.isArray((snapshot as any)?.user?.photos)
    ? ((snapshot as any).user.photos as string[])
    : [];

  const verificationTimeline: { title: string; helper: string; status: 'done' | 'pending' }[] = [
    {
      title: 'Photo verification',
      helper: snapshot.user.isVerified ? 'Completed' : 'Pending selfie check',
      status: snapshot.user.isVerified ? 'done' : 'pending',
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
    : [
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
      ];

  const discoverFilters: DiscoverFilter[] = engagementFallback.discoverFilters.length
    ? engagementFallback.discoverFilters
    : [
        { label: 'Nearby', helper: 'Within 10 miles' },
        { label: 'New this week', helper: 'Freshly onboarded' },
        { label: 'Recently active', helper: 'Seen in the last 24h' },
        { label: 'Verified only', helper: 'Photo / ID verified' },
        { label: 'Shared interests', helper: 'Match your lifestyle tags' },
        { label: 'Online now', helper: 'Ready to chat', premium: true },
        { label: 'Advanced filters', helper: 'Height, lifestyle, intent', premium: true },
      ];

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

  const messageThreads = await loadLocalThreads(userId);

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
          match.photos[0] ??
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
                  Trust score {snapshot.user.trustScore}
                </span>
              </div>
            </div>
            <HomeFeed profiles={feedProfiles} senderId={userId} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.8fr,1fr]" id="overview">
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
                <Link
                  href="/settings/profile"
                  className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-medium text-[#4338ca] shadow-sm"
                >
                  Edit profile
                </Link>
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
                  <Link
                    href="/matches?view=events"
                    className="mt-3 inline-flex rounded-full bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Plan outing
                  </Link>
                </div>
                <div className="rounded-2xl border border-[#f1f5f9] bg-white p-4">
                  <p className="text-sm font-medium text-[#475569]">Safety pulse</p>
                  <p className="text-lg font-semibold text-[#0f172a]">
                    Verification {verifiedLabel.toLowerCase()}
                  </p>
                  <Link
                    href="/trust-center"
                    className="mt-3 inline-flex rounded-full border border-[#d0d7ff] px-4 py-2 text-sm font-medium text-[#4338ca]"
                  >
                    Review status
                  </Link>
                </div>
              </div>
            </Card>

            <div id="messages">
              <RightRail matches={matchPreviews} messages={messageThreads} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
            <div id="discover" className="space-y-5">
              <DiscoverFilters filters={discoverFilters} />
              <DiscoverGrid people={discoverPeople} senderId={userId} />
            </div>
            <div id="likes">
              <LikesPanel likes={likesYou} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2" id="profile">
            <ProfileManager
              completion={profileCompletion}
              photos={profilePhotos}
              trustScore={snapshot.user.trustScore ?? 0}
              verified={snapshot.user.isVerified ?? false}
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
                    ? 'bg-[#eef2ff] text-[#312e81]'
                    : 'text-[#475569] hover:bg-[#f8fafc]'
                }`}
                aria-current={item.section && item.section === activeSection ? 'page' : undefined}
              >
                <span className="inline-flex items-center gap-3">
                  <item.icon
                    className={`${
                      item.section && item.section === activeSection
                        ? 'text-[#5b21b6]'
                        : 'text-[#cbd5f5]'
                    } size-4`}
                  />
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

function DiscoverGrid({ people, senderId }: { people: DiscoverPerson[]; senderId?: string }) {
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
          <DiscoverCard key={person.id} person={person} senderId={senderId} />
        ))}
      </div>
    </Card>
  );
}

function DiscoverCard({ person, senderId }: { person: DiscoverPerson; senderId?: string }) {
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
          <LikeActionButton
            senderId={senderId}
            receiverId={person.receiverId}
            action="like"
            highlight={`Discovery hi to ${person.name}`}
            className="flex-1 rounded-full bg-[#4338ca] px-4 py-2 text-center text-sm font-semibold text-white"
            disabled={!person.actionable}
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
          >
            Save
          </LikeActionButton>
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

function RightRail({ matches, messages }: { matches: MatchPreview[]; messages: MessageThread[] }) {
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
      <Link
        href={`/matches?highlight=${encodeURIComponent(match.name)}`}
        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338ca] shadow-sm"
      >
        {match.status}
      </Link>
    </div>
  );
}

function MessageSnippet({ thread }: { thread: MessageThread }) {
  return (
    <Link
      href={`/dashboard?section=messages#${encodeURIComponent(thread.name.toLowerCase())}`}
      className="flex items-center gap-3 rounded-2xl border border-[#eef2ff] p-3"
    >
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
    </Link>
  );
}
