import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_SERVICE_URL = (process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001').replace(/\/$/, '');

// Lightweight fallbacks so the UI keeps working when the identity service is offline locally.
const STUB_COMMUNITIES = [
  {
    id: 'community-nyc-runners',
    slug: 'nyc-runners',
    name: 'NYC Runners',
    description: 'Morning and evening runs across the five boroughs.',
    type: 'location',
    category: 'location',
    visibility: 'public',
    memberCount: 128,
    userRole: 'member',
    userJoinedAt: new Date('2024-11-12').toISOString(),
    eligibility: { allowed: true, reasons: [] },
  },
  {
    id: 'community-book-club',
    slug: 'book-club',
    name: 'Sunday Book Club',
    description: 'Cozy weekly reads and coffee chats.',
    type: 'interest',
    category: 'interest',
    visibility: 'public',
    memberCount: 64,
    userRole: 'member',
    userJoinedAt: new Date('2024-12-05').toISOString(),
    eligibility: { allowed: true, reasons: [] },
  },
  {
    id: 'community-verified-only',
    slug: 'verified-circle',
    name: 'Verified Circle',
    description: 'High-trust verified members discussing safety and dating.',
    type: 'verified',
    category: 'verified_only',
    visibility: 'restricted',
    memberCount: 42,
    userRole: null,
    userJoinedAt: null,
    isVerifiedOnly: true,
    eligibility: { allowed: false, reasons: ['Verification required'] },
  },
];

const STUB_POSTS: Record<string, any[]> = {
  'community-nyc-runners': [
    {
      id: 'post-1',
      communityId: 'community-nyc-runners',
      userId: 'runner-1',
      content: 'Sunset jog over the Williamsburg Bridge tonight. Pace ~9 min/mi. Anyone in?',
      createdAt: new Date().toISOString(),
      author: {
        id: 'runner-1',
        displayName: 'Alex',
        isVerified: true,
      },
      _count: { comments: 3, reactions: 12 },
    },
    {
      id: 'post-2',
      communityId: 'community-nyc-runners',
      userId: 'runner-2',
      content: 'Central Park loop on Saturday morning. Meet at Columbus Circle 8:00 AM.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      author: {
        id: 'runner-2',
        displayName: 'Priya',
        isVerified: false,
      },
      _count: { comments: 1, reactions: 5 },
    },
  ],
  'community-book-club': [
    {
      id: 'post-3',
      communityId: 'community-book-club',
      userId: 'reader-1',
      content: 'Next pick: "Tomorrow, and Tomorrow, and Tomorrow" — thoughts?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      author: {
        id: 'reader-1',
        displayName: 'Morgan',
        isVerified: true,
      },
      _count: { comments: 4, reactions: 9 },
    },
  ],
};

const STUB_MEMBERS: Record<string, any[]> = {
  'community-nyc-runners': [
    { id: 'member-1', userId: 'runner-1', role: 'member', status: 'active', joinedAt: new Date('2024-11-12').toISOString() },
    { id: 'member-2', userId: 'runner-2', role: 'member', status: 'active', joinedAt: new Date('2024-12-01').toISOString() },
  ],
  'community-book-club': [
    { id: 'member-3', userId: 'reader-1', role: 'member', status: 'active', joinedAt: new Date('2024-12-05').toISOString() },
  ],
};

const buildUrl = (
  path: string,
  params?: Record<string, string | null | undefined>
) => {
  const target = new URL(path, `${IDENTITY_SERVICE_URL}/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        target.searchParams.set(key, value);
      }
    });
  }
  return target.toString();
};

const parsePayload = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: 'Upstream returned a non-JSON payload', raw: text };
  }
};

const proxyGet = async (
  path: string,
  params?: Record<string, string | null | undefined>
) => {
  const response = await fetch(buildUrl(path, params), {
    cache: 'no-store',
  });
  const payload = await parsePayload(response);
  return NextResponse.json(payload, { status: response.status });
};

const proxyPost = async (
  path: string,
  body: Record<string, unknown>,
  params?: Record<string, string | null | undefined>
) => {
  const response = await fetch(buildUrl(path, params), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await parsePayload(response);
  return NextResponse.json(payload, { status: response.status });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const communityId = searchParams.get('communityId');
    const postId = searchParams.get('postId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    const cursor = searchParams.get('cursor');

    if (!action) {
      return NextResponse.json({ success: false, message: 'Missing action' }, { status: 400 });
    }

    if (action === 'browse') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      try {
        return await proxyGet('/api/v1/communities/browse', { userId, type, search, limit, skip });
      } catch (error) {
        console.warn('Communities browse falling back to stub data:', error);
        return NextResponse.json({ communities: STUB_COMMUNITIES, total: STUB_COMMUNITIES.length, source: 'stub' });
      }
    }

    if (action === 'my-communities') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      try {
        return await proxyGet('/api/v1/communities/my-communities', { userId });
      } catch (error) {
        console.warn('Communities my-communities falling back to stub data:', error);
        const joined = STUB_COMMUNITIES.filter((community) => community.userRole);
        return NextResponse.json({ communities: joined, total: joined.length, source: 'stub' });
      }
    }

    if (action === 'detail' && communityId) {
      try {
        return await proxyGet(`/api/v1/communities/${communityId}`, { userId });
      } catch (error) {
        const fallback = STUB_COMMUNITIES.find((community) => community.id === communityId);
        if (fallback) {
          console.warn('Community detail falling back to stub data:', error);
          return NextResponse.json({ community: fallback, source: 'stub' });
        }
      }
    }

    if (action === 'posts' && communityId) {
      try {
        return await proxyGet(`/api/v1/communities/${communityId}/posts`, {
          userId,
          limit,
          cursor,
        });
      } catch (error) {
        const posts = STUB_POSTS[communityId] || [];
        console.warn('Community posts falling back to stub data:', error);
        return NextResponse.json({ posts, nextCursor: null, source: 'stub' });
      }
    }

    if (action === 'members' && communityId) {
      try {
        return await proxyGet(`/api/v1/communities/${communityId}/members`, { userId, limit });
      } catch (error) {
        const members = STUB_MEMBERS[communityId] || [];
        console.warn('Community members falling back to stub data:', error);
        return NextResponse.json({ members, total: members.length, source: 'stub' });
      }
    }

    if (action === 'user-role' && communityId) {
      try {
        return await proxyGet(`/api/v1/communities/${communityId}/user-role`, { userId });
      } catch (error) {
        const fallback = STUB_COMMUNITIES.find((community) => community.id === communityId);
        if (fallback) {
          console.warn('Community user-role falling back to stub data:', error);
          return NextResponse.json({ role: fallback.userRole ?? null, source: 'stub' });
        }
      }
    }

    if (action === 'post' && communityId && postId) {
      try {
        return await proxyGet(`/api/v1/communities/${communityId}/posts/${postId}`, { userId });
      } catch (error) {
        const posts = STUB_POSTS[communityId] || [];
        const post = posts.find((item) => item.id === postId);
        if (post) {
          console.warn('Community post detail falling back to stub data:', error);
          return NextResponse.json({ post, source: 'stub' });
        }
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Communities API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const communityId = searchParams.get('communityId');
    const memberId = searchParams.get('memberId');
    const postId = searchParams.get('postId');

    if (!action) {
      return NextResponse.json({ success: false, message: 'Missing action' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    if (action === 'join' && communityId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      try {
        return await proxyPost(`/api/v1/communities/${communityId}/join`, { userId });
      } catch (error) {
        console.warn('Community join falling back to stub response:', error);
        return NextResponse.json({ success: true, message: 'Joined community (stub)', source: 'stub' });
      }
    }

    if (action === 'leave' && communityId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      try {
        return await proxyPost(`/api/v1/communities/${communityId}/leave`, { userId });
      } catch (error) {
        console.warn('Community leave falling back to stub response:', error);
        return NextResponse.json({ success: true, message: 'Left community (stub)', source: 'stub' });
      }
    }

    if (action === 'create-post' && communityId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/posts`, {
        userId,
        content: body.content,
        media: body.media,
      });
    }

    if (action === 'comment' && communityId && postId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/posts/${postId}/comments`, {
        userId,
        content: body.content,
      });
    }

    if (action === 'react' && communityId && postId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/posts/${postId}/react`, {
        userId,
        type: body.type,
      });
    }

    if (action === 'report' && communityId && postId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/posts/${postId}/report`, {
        userId,
        reason: body.reason,
        description: body.description,
        evidence: body.evidence,
      });
    }

    if (action === 'freeze' && communityId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing actor userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/freeze`, {
        actorId: userId,
        reason: body.reason,
      });
    }

    if (action === 'unfreeze' && communityId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing actor userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/unfreeze`, {
        actorId: userId,
      });
    }

    if (action === 'archive' && communityId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing actor userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/archive`, {
        actorId: userId,
        reason: body.reason,
      });
    }

    if (action === 'ban-member' && communityId && memberId) {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing actor userId' }, { status: 400 });
      }
      return proxyPost(`/api/v1/communities/${communityId}/members/${memberId}/ban`, {
        actorId: userId,
        reason: body.reason,
        durationMinutes: body.durationMinutes,
      });
    }

    if (action === 'eligibility') {
      return proxyPost('/api/v1/communities/eligibility', body as Record<string, unknown>);
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Communities API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
