export type MessagingStatusTone = 'violet' | 'rose' | 'amber' | 'emerald';

export interface MessagingThreadStatusDto {
  label: string;
  tone: MessagingStatusTone;
}

export interface MessagingThreadDto {
  id: string;
  name: string;
  snippet: string;
  vibeLine: string;
  lastActive: string;
  unread: number;
  avatar: string;
  route: string;
  status: MessagingThreadStatusDto;
  quickReplies: string[];
}
