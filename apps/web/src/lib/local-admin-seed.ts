export type AdminUser = {
  id: string;
  displayName: string;
  email?: string;
  city?: string;
  isVerified: boolean;
  banned?: boolean;
  createdAt?: string;
};

const seededUsers: AdminUser[] = [
  { id: 'alice', displayName: 'Alice Walker', email: 'alice@example.com', city: 'Brooklyn', isVerified: true, createdAt: new Date().toISOString() },
  { id: 'ben', displayName: 'Ben Hayes', email: 'ben@example.com', city: 'Long Island City', isVerified: false, createdAt: new Date().toISOString() },
  { id: 'chloe', displayName: 'Chloe Park', email: 'chloe@example.com', city: 'SoHo', isVerified: true, createdAt: new Date().toISOString() },
  { id: 'dani', displayName: 'Dani Rivera', email: 'dani@example.com', city: 'Williamsburg', isVerified: false, createdAt: new Date().toISOString() },
  { id: 'emily', displayName: 'Emily Stone', email: 'emily@example.com', city: 'SoHo', isVerified: true, createdAt: new Date().toISOString() },
];

export function getUsers() {
  return seededUsers;
}

export function getUser(id: string) {
  return seededUsers.find((u) => u.id === id) ?? null;
}

export function verifyUser(id: string) {
  const u = getUser(id);
  if (!u) return null;
  u.isVerified = true;
  return u;
}

export function banUser(id: string, ban: boolean) {
  const u = getUser(id);
  if (!u) return null;
  u.banned = ban;
  return u;
}

export function getMetrics() {
  return {
    signupsThisWeek: 42,
    bannedUsers: seededUsers.filter((u) => u.banned).length,
    verificationPassRate: Math.round((seededUsers.filter((u) => u.isVerified).length / seededUsers.length) * 100),
  };
}

export function getActivityLog() {
  return [
    { timestamp: new Date().toISOString(), message: 'Seeded: user alice verified' },
    { timestamp: new Date().toISOString(), message: 'Seeded: user chloe uploaded photo' },
  ];
}
