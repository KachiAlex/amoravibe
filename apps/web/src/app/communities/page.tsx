'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Card, PillButton } from '@/lib/ui-components';
import Link from 'next/link';
import {
  AlertTriangle,
  Archive,
  Gavel,
  Heart,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

type TabView = 'discover' | 'joined';
type CommunityTypeFilter = 'all' | 'interest' | 'identity' | 'location' | 'verified';

interface CommunityEligibility {
  allowed: boolean;
  reasons: string[];
}

interface CommunitySummary {
  id: string;
  name: string;
  description?: string | null;
  type?: 'interest' | 'identity' | 'location' | 'verified' | null;
  category?: 'interest' | 'identity' | 'location' | 'campus' | 'event' | 'verified_only' | null;
  memberCount: number;
  visibility?: 'public' | 'private' | 'restricted' | null;
  userRole?: string | null;
  userJoinedAt?: string | null;
  isVerifiedOnly?: boolean;
  frozenAt?: string | null;
  archivedAt?: string | null;
  slug?: string | null;
  eligibility?: CommunityEligibility;
}

interface CommunityEntryRequirements {
  minTrustScore?: number;
  verifiedOnly?: boolean;
  allowedOrientations?: string[];
  allowedGenders?: string[];
  discoverySpaces?: string[];
  location?: {
    city?: string;
    countryCode?: string;
  };
}

interface CommunityAllowedInteractions {
  posts?: boolean;
  comments?: boolean;
  reactions?: boolean;
  viewMembers?: boolean;
  media?: boolean;
}

interface CommunityMembershipSnapshot {
  id: string;
  role: string;
  status: string;
  joinedAt?: string;
  leftAt?: string | null;
}

interface CommunityDetail extends CommunitySummary {
  entryRequirements?: CommunityEntryRequirements | null;
  interactions?: CommunityAllowedInteractions | null;
  allowedInteractions?: CommunityAllowedInteractions | null;
  membership?: CommunityMembershipSnapshot | null;
  frozenReason?: string | null;
  archivedReason?: string | null;
  _count?: {
    members?: number;
    posts?: number;
  };
}

interface CommunityPostMedia {
  id: string;
  url: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
}

interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    displayName: string;
    isVerified: boolean;
  };
  media?: CommunityPostMedia[];
  mediaCount?: number;
  _count?: {
    comments: number;
    reactions: number;
  };
}

interface CommunityMemberRow {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt?: string | null;
  user?: {
    id: string;
    displayName: string;
    isVerified: boolean;
  };
}

const CATEGORY_FILTERS: { value: CommunityTypeFilter; label: string; helper: string }[] = [
  { value: 'all', label: 'All spaces', helper: 'Interest + identity' },
  { value: 'interest', label: 'Interests', helper: 'Hobbies, routines' },
  { value: 'identity', label: 'Identity', helper: 'Shared lived experience' },
  { value: 'location', label: 'Local', helper: 'City, neighborhood' },
  { value: 'verified', label: 'Verified only', helper: 'High trust' },
];

const DEFAULT_INTERACTIONS: CommunityAllowedInteractions = {
  posts: true,
  comments: true,
  reactions: true,
  media: true,
  viewMembers: true,
};

const formatCategoryLabel = (category?: CommunitySummary['category']) => {
  switch (category) {
    case 'identity':
      return 'Identity';
    case 'location':
      return 'Local';
    case 'campus':
      return 'Campus';
    case 'event':
      return 'Event';
    case 'verified_only':
      return 'Verified tier';
    case 'interest':
    default:
      return 'Interest';
  }
};

const formatEligibilityReason = (eligibility?: CommunityEligibility) =>
  eligibility?.reasons?.[0] ?? 'Currently unavailable';

const fetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

interface FeedState {
  posts: CommunityPost[];
  nextCursor: string | null;
  loading: boolean;
}

export default function CommunitiesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [tab, setTab] = useState<TabView>('discover');
  const [filter, setFilter] = useState<CommunityTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [browseState, setBrowseState] = useState<{ items: CommunitySummary[]; total: number; loading: boolean }>(
    { items: [], total: 0, loading: true }
  );
  const [myCommunities, setMyCommunities] = useState<CommunitySummary[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [communityDetail, setCommunityDetail] = useState<CommunityDetail | null>(null);
  const [feedState, setFeedState] = useState<FeedState>({ posts: [], nextCursor: null, loading: false });
  const [newPostContent, setNewPostContent] = useState('');
  const [pendingCommunityAction, setPendingCommunityAction] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminBanner, setAdminBanner] = useState<string | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState<string | null>(null);
  const [adminReason, setAdminReason] = useState('');
  const [banReason, setBanReason] = useState('Safety violation');
  const [banDurationMinutes, setBanDurationMinutes] = useState('');
  const [manualMemberId, setManualMemberId] = useState('');
  const [membersState, setMembersState] = useState<{ loading: boolean; items: CommunityMemberRow[] }>(
    { loading: false, items: [] }
  );

  const resetAdminInputs = useCallback(() => {
    setAdminBanner(null);
    setAdminReason('');
    setBanDurationMinutes('');
    setManualMemberId('');
    setBanReason('Safety violation');
    setAdminActionLoading(null);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await fetchJson<{ userId?: string }>('/api/session');
        setUserId(session.userId ?? null);
      } catch (err) {
        console.error('Failed to read session', err);
        setUserId(null);
      } finally {
        setSessionChecked(true);
      }
    };
    loadSession();
  }, []);

  const loadBrowse = useCallback(async () => {
    if (!userId) {
      return;
    }
    setBrowseState((prev) => ({ ...prev, loading: true }));
    try {
      const params = new URLSearchParams({
        action: 'browse',
        userId,
        limit: '30',
      });
      if (filter !== 'all') {
        params.set('type', filter);
      }
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }

      const data = await fetchJson<{ communities?: CommunitySummary[]; total?: number; data?: CommunitySummary[] }>(
        `/api/dashboard/communities?${params.toString()}`
      );

      const payload = data.communities ?? data.data ?? [];
      setBrowseState({ items: payload, total: data.total ?? payload.length, loading: false });
    } catch (err) {
      console.error('Failed to load communities', err);
      setBrowseState((prev) => ({ ...prev, loading: false }));
      setError('Unable to load communities right now.');
    }
  }, [userId, filter, searchTerm]);

  useEffect(() => {
    loadBrowse();
  }, [loadBrowse]);

  const loadMyCommunities = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      const data = await fetchJson<{ communities?: CommunitySummary[]; data?: CommunitySummary[] }>(
        `/api/dashboard/communities?action=my-communities&userId=${userId}`
      );
      setMyCommunities(data.communities ?? data.data ?? []);
    } catch (err) {
      console.error('Failed to load my communities', err);
    }
  }, [userId]);

  const fetchCommunityDetail = useCallback(
    async (communityId: string) => {
      if (!userId) {
        return null;
      }
      try {
        const data = await fetchJson<{ community?: CommunityDetail | null }>(
          `/api/dashboard/communities?action=detail&communityId=${communityId}&userId=${userId}`
        );
        return data.community ?? null;
      } catch (err) {
        console.error('Failed to load community detail', err);
        return null;
      }
    },
    [userId]
  );

  useEffect(() => {
    loadMyCommunities();
  }, [loadMyCommunities]);

  useEffect(() => {
    resetAdminInputs();
  }, [selectedCommunityId, resetAdminInputs]);

  const loadPosts = useCallback(
    async (communityId: string, cursor?: string) => {
      if (!userId) {
        return;
      }
      setFeedState((prev) => ({ ...prev, loading: true }));
      try {
        const params = new URLSearchParams({
          action: 'posts',
          communityId,
          userId,
          limit: '20',
        });
        if (cursor) {
          params.set('cursor', cursor);
        }

        const data = await fetchJson<{ posts?: CommunityPost[]; nextCursor?: string | null; data?: CommunityPost[] }>(
          `/api/dashboard/communities?${params.toString()}`
        );

        const posts = data.posts ?? data.data ?? [];
        setFeedState((prev) => ({
          posts: cursor ? [...prev.posts, ...posts] : posts,
          nextCursor: data.nextCursor ?? null,
          loading: false,
        }));
      } catch (err) {
        console.error('Failed to load posts', err);
        setFeedState((prev) => ({ ...prev, loading: false }));
      }
    },
    [userId]
  );

  const fetchMembers = useCallback(
    async (communityId: string): Promise<CommunityMemberRow[]> => {
      if (!userId) {
        return [];
      }
      const data = await fetchJson<{ members?: CommunityMemberRow[]; data?: CommunityMemberRow[] }>(
        `/api/dashboard/communities?action=members&communityId=${communityId}&userId=${userId}`
      );
      return data.members ?? data.data ?? [];
    },
    [userId]
  );

  const isModeratorView = useMemo(() => {
    const role = communityDetail?.membership?.role?.toLowerCase();
    return role ? ['moderator', 'admin', 'owner', 'staff'].includes(role) : false;
  }, [communityDetail?.membership?.role]);

  useEffect(() => {
    if (!selectedCommunityId || !userId) {
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setCommunityDetail(null);
    setFeedState({ posts: [], nextCursor: null, loading: true });
    setNewPostContent('');

    const hydrateDetail = async () => {
      const detail = await fetchCommunityDetail(selectedCommunityId);
      if (!cancelled) {
        setCommunityDetail(detail);
        setDetailLoading(false);
      }
    };

    hydrateDetail();
    loadPosts(selectedCommunityId);

    return () => {
      cancelled = true;
    };
  }, [selectedCommunityId, userId, loadPosts, fetchCommunityDetail]);

  useEffect(() => {
    if (!communityDetail?.id || !isModeratorView) {
      setMembersState({ loading: false, items: [] });
      return;
    }
    let cancelled = false;
    setMembersState((prev) => ({ ...prev, loading: true }));
    fetchMembers(communityDetail.id)
      .then((members) => {
        if (!cancelled) {
          setMembersState({ loading: false, items: members });
        }
      })
      .catch((err) => {
        console.error('Failed to load members', err);
        if (!cancelled) {
          setMembersState((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [communityDetail?.id, isModeratorView, fetchMembers]);

  const handleJoinCommunity = async (communityId: string) => {
    if (!userId) {
      return;
    }
    setPendingCommunityAction(communityId);
    try {
      const data = await fetchJson<{ status?: string; eligibility?: CommunityEligibility }>(
        `/api/dashboard/communities?action=join&communityId=${communityId}&userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (data.status !== 'active') {
        setError(formatEligibilityReason(data.eligibility));
        return;
      }

      await Promise.all([loadBrowse(), loadMyCommunities()]);
      if (selectedCommunityId === communityId) {
        loadPosts(communityId);
      }
    } catch (err) {
      console.error('Failed to join community', err);
      setError('Unable to join this community right now.');
    } finally {
      setPendingCommunityAction(null);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!userId) {
      return;
    }
    setPendingCommunityAction(communityId);
    try {
      await fetchJson(`/api/dashboard/communities?action=leave&communityId=${communityId}&userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      await Promise.all([loadBrowse(), loadMyCommunities()]);
      if (selectedCommunityId === communityId) {
        setSelectedCommunityId(null);
        setCommunityDetail(null);
        setFeedState({ posts: [], nextCursor: null, loading: false });
      }
    } catch (err) {
      console.error('Failed to leave community', err);
      setError('Unable to leave this community.');
    } finally {
      setPendingCommunityAction(null);
    }
  };

  const handleCreatePost = async () => {
    if (!communityDetail || !userId || !newPostContent.trim()) {
      return;
    }
    setCreatingPost(true);
    try {
      await fetchJson(`/api/dashboard/communities?action=create-post&communityId=${communityDetail.id}&userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, content: newPostContent }),
        }
      );
      setNewPostContent('');
      loadPosts(communityDetail.id);
    } catch (err) {
      console.error('Failed to create post', err);
      setError('Unable to publish post.');
    } finally {
      setCreatingPost(false);
    }
  };

  const refreshCommunityAfterAdminAction = useCallback(async () => {
    if (!communityDetail?.id) {
      return;
    }
    const detail = await fetchCommunityDetail(communityDetail.id);
    setCommunityDetail(detail);
    await loadPosts(communityDetail.id);
    await Promise.all([loadBrowse(), loadMyCommunities()]);
    if (detail?.id) {
      try {
        setMembersState((prev) => ({ ...prev, loading: true }));
        const members = await fetchMembers(detail.id);
        setMembersState({ loading: false, items: members });
      } catch (err) {
        console.error('Failed to refresh members', err);
        setMembersState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, [communityDetail?.id, fetchCommunityDetail, loadPosts, loadBrowse, loadMyCommunities, fetchMembers]);

  const performCommunityAdminAction = async (
    action: 'freeze' | 'unfreeze' | 'archive',
    payload?: Record<string, unknown>
  ) => {
    if (!communityDetail || !userId) {
      return;
    }
    setAdminActionLoading(action);
    setAdminBanner(null);
    try {
      await fetchJson(`/api/dashboard/communities?action=${action}&communityId=${communityDetail.id}&userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload ?? {}),
        }
      );
      await refreshCommunityAfterAdminAction();
      setAdminBanner(
        action === 'freeze'
          ? 'Community frozen. Members see a pause notice.'
          : action === 'unfreeze'
            ? 'Community unfrozen.'
            : 'Community archived.'
      );
    } catch (err) {
      console.error(`Failed to ${action} community`, err);
      setError(`Unable to ${action} this community right now.`);
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleFreezeCommunity = () =>
    performCommunityAdminAction('freeze', {
      reason: adminReason || 'Safety freeze initiated via dashboard',
    });

  const handleUnfreezeCommunity = () => performCommunityAdminAction('unfreeze');

  const handleArchiveCommunity = () =>
    performCommunityAdminAction('archive', {
      reason: adminReason || 'Archived via dashboard',
    });

  const handleBanMember = async (memberId: string) => {
    if (!communityDetail || !userId || !memberId) {
      return;
    }
    const parsedDuration = banDurationMinutes ? parseInt(banDurationMinutes, 10) : undefined;
    const durationMinutes = Number.isFinite(parsedDuration) ? parsedDuration : undefined;
    setAdminActionLoading(`ban-${memberId}`);
    setAdminBanner(null);
    try {
      await fetchJson(
        `/api/dashboard/communities?action=ban-member&communityId=${communityDetail.id}&memberId=${memberId}&userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: banReason || 'Community moderation action',
            durationMinutes,
          }),
        }
      );
      await refreshCommunityAfterAdminAction();
      setAdminBanner('Member banned from this community.');
    } catch (err) {
      console.error('Failed to ban member', err);
      setError('Unable to ban this member right now.');
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleManualBan = async () => {
    const memberId = manualMemberId.trim();
    if (!memberId) {
      return;
    }
    await handleBanMember(memberId);
    setManualMemberId('');
  };

  const selectedCommunitySummary = useMemo(
    () => browseState.items.find((c) => c.id === selectedCommunityId) ?? myCommunities.find((c) => c.id === selectedCommunityId) ?? null,
    [browseState.items, myCommunities, selectedCommunityId]
  );

  const interactions: CommunityAllowedInteractions = useMemo(() => {
    return (
      communityDetail?.interactions ||
      communityDetail?.allowedInteractions ||
      DEFAULT_INTERACTIONS
    );
  }, [communityDetail]);

  const communityFrozen = Boolean(communityDetail?.frozenAt);
  const communityArchived = Boolean(communityDetail?.archivedAt);

  const canPost = Boolean(
    interactions.posts &&
      communityDetail?.membership &&
      communityDetail.membership.status !== 'banned' &&
      !communityDetail.archivedAt &&
      !communityDetail.frozenAt
  );

  const renderCommunityCard = (community: CommunitySummary) => {
    const eligible = community.eligibility?.allowed ?? true;
    const isMember = Boolean(community.userRole);
    const disabled = !eligible && !isMember;

    return (
      <Card
        key={community.id}
        className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]"
        onClick={() => setSelectedCommunityId(community.id)}
        role="button"
        tabIndex={0}
      >
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl text-ink-900">{community.name}</h3>
          <Badge tone="secondary" className="text-xs uppercase tracking-wider">
            {formatCategoryLabel(community.category)}
          </Badge>
          {community.isVerifiedOnly && (
            <Badge tone="primary" className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified only
            </Badge>
          )}
          {community.frozenAt && (
            <Badge tone="secondary" className="text-xs bg-rose-50 text-rose-700">
              Activity frozen
            </Badge>
          )}
        </div>
        <p className="text-sm text-ink-600">
          {community.description || 'No description provided yet.'}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-500">
          <span>{community.memberCount.toLocaleString()} members</span>
          {community.visibility && <span>{community.visibility} visibility</span>}
          {community.slug && <span>/{community.slug}</span>}
        </div>
        {!eligible && (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {formatEligibilityReason(community.eligibility)}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedCommunityId(community.id);
            }}
          >
            View detail →
          </button>
          <div className="flex gap-3">
            {isMember ? (
              <PillButton
                onClick={(event) => {
                  event.stopPropagation();
                  handleLeaveCommunity(community.id);
                }}
                disabled={pendingCommunityAction === community.id}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                {pendingCommunityAction === community.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Leave'}
              </PillButton>
            ) : (
              <PillButton
                onClick={(event) => {
                  event.stopPropagation();
                  handleJoinCommunity(community.id);
                }}
                disabled={pendingCommunityAction === community.id || disabled}
              >
                {pendingCommunityAction === community.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Join
                  </span>
                )}
              </PillButton>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderMyCommunity = (community: CommunitySummary) => (
    <Card
      key={community.id}
      className="rounded-2xl border border-white/60 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm hover:shadow-lg"
      onClick={() => setSelectedCommunityId(community.id)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Joined</p>
          <h4 className="mt-1 font-display text-xl text-ink-900">{community.name}</h4>
          <p className="text-xs text-slate-500">{community.memberCount} members</p>
        </div>
        <Sparkles className="h-5 w-5 text-amber-400" />
      </div>
    </Card>
  );

  const renderRequirements = (requirements?: CommunityEntryRequirements | null) => {
    if (!requirements) {
      return (
        <p className="text-sm text-slate-500">Open community • No extra requirements</p>
      );
    }
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <RequirementBadge
          label="Trust score"
          value={requirements.minTrustScore ? `≥ ${requirements.minTrustScore}` : 'Open'}
        />
        <RequirementBadge
          label="Verification"
          value={requirements.verifiedOnly ? 'Verified only' : 'Optional'}
        />
        <RequirementBadge
          label="Orientation"
          value={requirements.allowedOrientations?.join(', ') || 'All orientations'}
        />
        <RequirementBadge
          label="Gender"
          value={requirements.allowedGenders?.join(', ') || 'All genders'}
        />
        <RequirementBadge
          label="Discovery space"
          value={requirements.discoverySpaces?.join(', ') || 'Any space'}
        />
        <RequirementBadge
          label="Location"
          value={
            requirements.location?.city
              ? `${requirements.location.city} (${requirements.location.countryCode ?? 'local'})`
              : 'No lock'
          }
        />
      </div>
    );
  };

  if (!sessionChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4 border-none bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white">
          <Badge tone="primary" className="mx-auto w-fit border border-white/30 bg-white/10 text-xs uppercase">
            Communities
          </Badge>
          <h1 className="font-display text-4xl">Sign in required</h1>
          <p className="text-white/80">
            Finish onboarding to unlock curated identity & interest communities.
          </p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Complete onboarding</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fefaf2] via-white to-[#eef2ff] px-6 pb-24 pt-12 sm:px-10">
      <section className="mx-auto max-w-6xl rounded-[42px] border border-white/60 bg-white/90 p-8 shadow-[0_45px_120px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-4">
          <Badge tone="primary" className="w-fit rounded-full bg-amber-100 text-amber-600">
            Communities
          </Badge>
          <div className="space-y-3">
            <h1 className="font-display text-4xl text-ink-900">Spaces for connection before the date</h1>
            <p className="max-w-3xl text-lg text-ink-600">
              Join curated interest, identity, and locality-based spaces moderated by Lovedate. Eligibility is enforced server-side—when in doubt, tap into trust tools to learn why a community is locked.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl bg-gradient-to-r from-[#161b2e] to-[#1f1b2d] p-6 text-white md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Your standing</p>
              <p className="mt-2 text-2xl font-semibold">Verified preferred</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">In progress</p>
              <p className="mt-2 text-2xl font-semibold">{myCommunities.length.toString().padStart(2, '0')} joined</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Signals</p>
              <p className="mt-2 text-2xl font-semibold">{browseState.total.toString().padStart(2, '0')} live spaces</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl space-y-6">
        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'discover'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setTab('discover')}
            >
              Discover ({browseState.total})
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'joined'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setTab('joined')}
            >
              My spaces ({myCommunities.length})
            </button>
          </div>
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              className="w-full rounded-full border border-slate-200 bg-white/70 py-2 pl-10 pr-4 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              placeholder="Search names, tags, vibes"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {CATEGORY_FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === item.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-white/80 bg-white/80 text-slate-600 hover:border-slate-200'
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className={filter === item.value ? 'text-white/70' : 'text-slate-500'}>{item.helper}</p>
            </button>
          ))}
        </div>

        {tab === 'discover' && myCommunities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">Your current communities</p>
              <button
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                onClick={() => setTab('joined')}
              >
                View all →
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {myCommunities.slice(0, 3).map((community) => renderMyCommunity(community))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tab === 'discover' ? (
            browseState.loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : browseState.items.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center">
                <Users className="h-10 w-10 text-slate-300" />
                <h3 className="font-display text-2xl text-slate-800">No communities matched</h3>
                <p className="text-sm text-slate-500">Adjust your filters or check again later.</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {browseState.items.map((community) => renderCommunityCard(community))}
              </div>
            )
          ) : myCommunities.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="font-display text-2xl text-slate-800">No memberships yet</h3>
              <p className="text-sm text-slate-500">Return to discover and request access.</p>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {myCommunities.map((community) => (
                <div key={community.id} className="space-y-4">
                  {renderMyCommunity(community)}
                  <div className="flex items-center justify-end">
                    <PillButton onClick={() => handleLeaveCommunity(community.id)}>
                      Leave space
                    </PillButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedCommunityId && (
        <section className="mx-auto mt-10 max-w-6xl">
          <Card className="relative grid gap-8 rounded-[42px] border border-white/80 bg-white/95 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.15)] lg:grid-cols-[1.2fr_0.8fr]">
            <button
              className="absolute right-6 top-6 text-slate-400 transition hover:text-slate-900"
              onClick={() => setSelectedCommunityId(null)}
              aria-label="Close community detail"
            >
              <X className="h-5 w-5" />
            </button>

            {detailLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 lg:col-span-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Loading community detail…</p>
              </div>
            ) : communityDetail ? (
              <>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-3xl text-ink-900">{communityDetail.name}</h2>
                      {communityDetail.isVerifiedOnly && (
                        <Badge tone="primary" className="flex items-center gap-1 text-xs">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified only
                        </Badge>
                      )}
                      {communityDetail.frozenAt && (
                        <Badge tone="secondary" className="text-xs bg-rose-50 text-rose-700">
                          Frozen
                        </Badge>
                      )}
                      {communityDetail.archivedAt && (
                        <Badge tone="secondary" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-slate-600">{communityDetail.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>{communityDetail.memberCount.toLocaleString()} members</span>
                      {communityDetail._count?.posts != null && (
                        <span>{communityDetail._count.posts} posts</span>
                      )}
                      {communityDetail.membership?.status && (
                        <span className="font-semibold text-slate-700">
                          Status: {communityDetail.membership.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {communityDetail.frozenAt && (
                    <div className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>
                        Activity temporarily paused. {communityDetail.frozenReason || 'Safety team is reviewing recent reports.'}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Entry requirements
                    </p>
                    {renderRequirements(communityDetail.entryRequirements)}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Allowed interactions
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(interactions).map(([key, enabled]) => (
                        <Badge
                          key={key}
                          tone={enabled ? 'primary' : 'secondary'}
                          className={enabled ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Latest posts
                    </p>
                    {canPost ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
                        <textarea
                          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                          placeholder="Share a prompt, win, or question"
                          value={newPostContent}
                          onChange={(event) => setNewPostContent(event.target.value)}
                          rows={3}
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Posting as you</span>
                          <PillButton
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || creatingPost}
                          >
                            {creatingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish'}
                          </PillButton>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                        Posting is disabled for your current status.
                      </div>
                    )}

                    <div className="space-y-4">
                      {feedState.loading && feedState.posts.length === 0 ? (
                        <div className="flex justify-center py-10 text-slate-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : feedState.posts.length === 0 ? (
                        <p className="rounded-3xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                          No posts yet.
                        </p>
                      ) : (
                        feedState.posts.map((post) => (
                          <Card key={post.id} className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-slate-800">{post.author?.displayName ?? 'Member'}</p>
                                <p className="text-xs text-slate-400">
                                  {new Date(post.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {post.author?.isVerified && (
                                <Badge tone="primary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="mt-3 text-sm text-slate-700">{post.content}</p>
                            <div className="mt-4 flex gap-4 text-xs text-slate-500">
                              <button className="inline-flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                {post._count?.reactions ?? 0}
                              </button>
                              <button className="inline-flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {post._count?.comments ?? 0}
                              </button>
                            </div>
                          </Card>
                        ))
                      )}

                      {feedState.nextCursor && (
                        <div className="flex justify-center">
                          <PillButton
                            onClick={() =>
                              selectedCommunityId && loadPosts(selectedCommunityId, feedState.nextCursor ?? undefined)
                            }
                            disabled={feedState.loading}
                          >
                            {feedState.loading ? 'Loading…' : 'Load more'}
                          </PillButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Membership</p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {communityDetail.membership ? 'You are in' : 'Apply to join'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {communityDetail.membership
                        ? `Joined ${communityDetail.membership.joinedAt ? new Date(communityDetail.membership.joinedAt).toLocaleDateString() : 'recently'}`
                        : formatEligibilityReason(communityDetail.eligibility)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {communityDetail.membership ? (
                      <PillButton
                        className="w-full"
                        onClick={() => handleLeaveCommunity(communityDetail.id)}
                        disabled={pendingCommunityAction === communityDetail.id}
                      >
                        {pendingCommunityAction === communityDetail.id ? 'Leaving…' : 'Leave community'}
                      </PillButton>
                    ) : (
                      <PillButton
                        className="w-full"
                        onClick={() => handleJoinCommunity(communityDetail.id)}
                        disabled={pendingCommunityAction === communityDetail.id}
                      >
                        {pendingCommunityAction === communityDetail.id ? 'Requesting…' : 'Request access'}
                      </PillButton>
                    )}
                    <button className="w-full rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400">
                      See safety center
                    </button>
                  </div>

                  {isModeratorView && adminBanner && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                      {adminBanner}
                    </div>
                  )}

                  {isModeratorView && (
                    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white/80 p-5">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Staff controls</p>
                        <p className="text-sm text-slate-500">Moderation changes apply instantly and fan out to members.</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2">
                          <p className="text-xs text-slate-500">Members</p>
                          <p className="text-lg font-semibold text-slate-900">{communityDetail.memberCount?.toLocaleString() ?? '—'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2">
                          <p className="text-xs text-slate-500">Visible members</p>
                          <p className="text-lg font-semibold text-slate-900">{membersState.items.length || '—'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2">
                          <p className="text-xs text-slate-500">Posts</p>
                          <p className="text-lg font-semibold text-slate-900">{communityDetail._count?.posts ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${communityFrozen ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          <Lock className="h-3.5 w-3.5" /> {communityFrozen ? 'Frozen' : 'Live'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${communityArchived ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          <Archive className="h-3.5 w-3.5" /> {communityArchived ? 'Archived' : 'Active'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${canPost ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                          <MessageSquare className="h-3.5 w-3.5" /> {canPost ? 'Posting enabled' : 'Posting locked'}
                        </span>
                      </div>
                      {communityArchived && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                          Archived communities cannot be reopened from this surface. Use back-office tools to restore if needed.
                        </div>
                      )}
                      <textarea
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                        placeholder="Reason or note shown to audit log"
                        value={adminReason}
                        onChange={(event) => setAdminReason(event.target.value)}
                        rows={3}
                        disabled={communityArchived}
                      />
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                          <Lock className="h-3 w-3" /> Community controls
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {!communityFrozen ? (
                            <PillButton
                              className="w-full"
                              onClick={handleFreezeCommunity}
                              disabled={communityArchived || adminActionLoading === 'freeze'}
                            >
                              {adminActionLoading === 'freeze' ? 'Freezing…' : 'Freeze activity'}
                            </PillButton>
                          ) : (
                            <PillButton
                              className="w-full"
                              onClick={handleUnfreezeCommunity}
                              disabled={communityArchived || adminActionLoading === 'unfreeze'}
                            >
                              {adminActionLoading === 'unfreeze' ? 'Releasing…' : 'Unfreeze community'}
                            </PillButton>
                          )}
                          <button
                            className="w-full rounded-full border border-rose-200 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                            onClick={handleArchiveCommunity}
                            disabled={communityArchived || adminActionLoading === 'archive'}
                          >
                            {communityArchived ? 'Space archived' : adminActionLoading === 'archive' ? 'Archiving…' : 'Archive space'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                          <Gavel className="h-3 w-3" /> Member enforcement
                        </p>
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                          placeholder="Membership ID"
                          value={manualMemberId}
                          onChange={(event) => setManualMemberId(event.target.value)}
                          disabled={communityArchived}
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                            placeholder="Duration (minutes)"
                            value={banDurationMinutes}
                            onChange={(event) => setBanDurationMinutes(event.target.value)}
                            disabled={communityArchived}
                          />
                          <input
                            className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                            placeholder="Reason"
                            value={banReason}
                            onChange={(event) => setBanReason(event.target.value)}
                            disabled={communityArchived}
                          />
                        </div>
                        <PillButton
                          className="w-full"
                          onClick={handleManualBan}
                          disabled={
                            communityArchived ||
                            !manualMemberId.trim() ||
                            (adminActionLoading?.startsWith('ban-') ?? false)
                          }
                        >
                          {adminActionLoading?.startsWith('ban-') ? 'Banning…' : 'Ban member'}
                        </PillButton>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                          <span>Recent members</span>
                          <span>{membersState.items.length ? `${Math.min(5, membersState.items.length)} shown` : '0 shown'}</span>
                        </div>
                        {membersState.loading ? (
                          <p className="text-xs text-slate-500">Loading members…</p>
                        ) : membersState.items.length === 0 ? (
                          <p className="text-xs text-slate-500">No members visible or access restricted.</p>
                        ) : (
                          membersState.items.slice(0, 5).map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {member.user?.displayName ?? member.userId}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {member.role} • {member.status}
                                </p>
                              </div>
                              <button
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:text-slate-400"
                                onClick={() => handleBanMember(member.id)}
                                disabled={communityArchived || adminActionLoading === `ban-${member.id}`}
                              >
                                {adminActionLoading === `ban-${member.id}` ? 'Banning…' : 'Ban'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {communityDetail.entryRequirements?.location?.city && (
                    <div className="flex items-center gap-2 rounded-2xl bg-white/70 p-3 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>
                        Centered in {communityDetail.entryRequirements.location.city}
                        {communityDetail.entryRequirements.location.countryCode ? `, ${communityDetail.entryRequirements.location.countryCode}` : ''}
                      </span>
                    </div>
                  )}

                  {selectedCommunitySummary && !selectedCommunitySummary.eligibility?.allowed && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                      {formatEligibilityReason(selectedCommunitySummary.eligibility)}
                    </div>
                  )}
                </aside>
              </>
            ) : (
              <div className="lg:col-span-2">
                <p className="rounded-3xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                  Community metadata unavailable.
                </p>
              </div>
            )}
          </Card>
        </section>
      )}
    </main>
  );
}

function RequirementBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
