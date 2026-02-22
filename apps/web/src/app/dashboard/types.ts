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
  avatar: string;
  preview: string;
  time: string;
};

export type DashboardData = {
  userName: string;
  stats: { matches: number; chats: number; views: number };
  matches: Match[];
  messages: Message[];
};
