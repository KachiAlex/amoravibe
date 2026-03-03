export type Match = {
  id: string;
  name: string;
  avatar: string;
  tagline?: string;
  matchPercent?: number;
};

export type Message = {
  id: string;
  from: string;
  avatar?: string;
  preview?: string;
  time?: string;
  text?: string;
  unread?: boolean;
  online?: boolean;
  typing?: boolean;
  muted?: boolean;
  archived?: boolean;
};

export type DashboardData = {
  userName: string;
  userFirstName: string;
  userAvatar: string | null;
  userOrientation: string | null;
  stats: { matches: number; chats: number; views: number };
  matches: Match[];
  messages: Message[];
};
