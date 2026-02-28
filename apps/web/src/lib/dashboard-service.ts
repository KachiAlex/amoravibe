import type { DashboardData, Match as DashboardMatch, Message as DashboardMessage } from '@/app/dashboard/types';
import db from '@/lib/db';

async function buildFromDatabase(userId: string) {
  const [matches, messages, stats] = await Promise.all([
    db.match.findMany({
      where: {
        OR: [{ requesterId: userId }, { targetUserId: userId }],
        status: 'CONNECTED',
      },
      include: { requester: true, target: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    db.message.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.match.count({ where: { status: 'CONNECTED', OR: [{ requesterId: userId }, { targetUserId: userId }] } }),
  ]);

  const formattedMatches: DashboardMatch[] = matches.map((match) => {
    const other = match.requesterId === userId ? match.target : match.requester;
    return {
      id: match.id,
      name: other.displayName ?? other.name ?? 'Match',
      avatar: other.avatar ?? '',
      tagline: other.about ?? undefined,
      role: other.job ?? undefined,
      city: other.location ?? undefined,
      tags: other.interests ?? [],
      matchPercent: match.compatibilityScore ?? 0,
    };
  });

  const formattedMessages: DashboardMessage[] = messages.map((message) => ({
    id: message.id,
    from: message.fromId,
    preview: message.text,
    time: message.createdAt.toISOString(),
    unread: !message.read,
  }));

  return {
    userName: userId,
    stats: { matches: stats, chats: messages.length, views: 0 },
    matches: formattedMatches,
    messages: formattedMessages,
  } satisfies DashboardData;
}

export async function fetchDashboardSnapshot(userId: string | null): Promise<DashboardData> {
  if (!userId) {
    return {
      userName: 'Guest',
      stats: { matches: 0, chats: 0, views: 0 },
      matches: [],
      messages: [],
    };
  }

  return buildFromDatabase(userId);
}
