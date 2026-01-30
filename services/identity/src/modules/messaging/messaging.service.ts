import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { MessagingThreadDto, MessagingStatusTone } from './dto/messaging-thread.dto';

const QUICK_REPLY_LIBRARY: string[][] = [
  ['Confirm plans', 'Send vibe check', 'Drop emoji'],
  ['Share playlist', 'Send voice note', 'Pin location'],
  ['Suggest café', 'Pick outfit', 'Ask for rec'],
  ['Call tonight?', 'Reschedule', 'Send spark'],
  ['Keep it casual', 'Escalate plans', 'Share update'],
];

const STATUS_VARIANTS: Array<{ label: string; tone: MessagingStatusTone }> = [
  { label: 'Typing now', tone: 'violet' },
  { label: 'Shared a voice note', tone: 'rose' },
  { label: 'Awaiting your RSVP', tone: 'amber' },
  { label: 'Dropped a location pin', tone: 'emerald' },
  { label: 'Queued a mixtape', tone: 'violet' },
];

const VIBE_LINES = [
  'Gallery crawl invites pending.',
  'Analog film swap later tonight?',
  'Rooftop after-party planning thread.',
  'Bouldering meetup still on?',
  'Tea flight tasting at noon.',
  'Night market scouting mission.',
  'Sound bath RSVP waiting.',
  'Mixtape exchange queued.',
];

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80';

const DASHBOARD_ROUTE_PREFIX = '/messages';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async getThreads(userId: string, limit = 6): Promise<MessagingThreadDto[]> {
    await this.ensureUser(userId);

    const threads = await this.prisma.messageThread.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        participants: { include: { user: true } },
        lastMessage: { include: { sender: true } },
      },
    });

    return threads.map((thread) => this.mapThread(thread, userId));
  }

  private async ensureUser(userId: string) {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`User ${userId} not found`);
    }
  }

  private mapThread(
    thread: Prisma.MessageThreadGetPayload<{
      include: {
        participants: { include: { user: true } };
        lastMessage: { include: { sender: true } };
      };
    }>,
    viewerId: string
  ): MessagingThreadDto {
    const viewerParticipant = thread.participants.find(
      (participant) => participant.userId === viewerId
    );
    const otherParticipant = thread.participants.find(
      (participant) => participant.userId !== viewerId
    )?.user;

    const displayName = otherParticipant?.displayName ?? thread.title ?? 'Conversation';
    const avatar = this.extractPrimaryPhoto(otherParticipant?.photos) ?? FALLBACK_AVATAR;
    const snippet = thread.lastMessage?.body ?? 'Say hi and keep the vibe going.';
    const vibeLine = this.pickDeterministic(VIBE_LINES, thread.id, displayName.length);
    const statusVariant = this.pickDeterministic(STATUS_VARIANTS, thread.id, snippet.length);
    const quickReplies = this.pickDeterministic(QUICK_REPLY_LIBRARY, thread.id, vibeLine.length);

    return {
      id: thread.id,
      name: displayName,
      snippet,
      vibeLine,
      lastActive: this.formatRelativeTime(thread.updatedAt),
      unread: viewerParticipant?.unreadCount ?? 0,
      avatar,
      route: `${DASHBOARD_ROUTE_PREFIX}/${thread.id}`,
      status: statusVariant,
      quickReplies,
    };
  }

  private pickDeterministic<T>(options: T[], seedA: string, seedB: number): T {
    const hash = Array.from(seedA).reduce((acc, char) => acc + char.charCodeAt(0), seedB);
    const index = Math.abs(hash) % options.length;
    return options[index];
  }

  private extractPrimaryPhoto(photos?: Prisma.JsonValue | null): string | null {
    if (!photos || !Array.isArray(photos)) {
      return null;
    }

    const firstPhoto = photos.find((photo) => typeof photo === 'string' && photo.length > 0);
    return (firstPhoto as string) ?? null;
  }

  private formatRelativeTime(date: Date | string): string {
    const target = typeof date === 'string' ? new Date(date) : date;
    const diffMs = Date.now() - target.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (Number.isNaN(diffMinutes) || diffMinutes < 1) {
      return 'Just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`;
  }
}
