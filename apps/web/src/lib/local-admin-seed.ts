export type AdminUser = {
  id: string;
  displayName: string;
  email?: string;
  city?: string;
  isVerified: boolean;
  banned?: boolean;
  createdAt?: string;
};

const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(process.cwd(), 'apps', 'web', 'data', 'admin-users.json');

const seededUsers: AdminUser[] = [
  { id: 'alice', displayName: 'Alice Walker', email: 'alice@example.com', city: 'Brooklyn', isVerified: true, createdAt: new Date().toISOString() },
  { id: 'ben', displayName: 'Ben Hayes', email: 'ben@example.com', city: 'Long Island City', isVerified: false, createdAt: new Date().toISOString() },
  { id: 'chloe', displayName: 'Chloe Park', email: 'chloe@example.com', city: 'SoHo', isVerified: true, createdAt: new Date().toISOString() },
  { id: 'dani', displayName: 'Dani Rivera', email: 'dani@example.com', city: 'Williamsburg', isVerified: false, createdAt: new Date().toISOString() },
  { id: 'emily', displayName: 'Emily Stone', email: 'emily@example.com', city: 'SoHo', isVerified: true, createdAt: new Date().toISOString() },
];

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeData(users: AdminUser[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    // ignore write errors for local preview
  }
}

function loadData(): AdminUser[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    // fallback to seeded
  }
  // initial write for first run
  writeData(seededUsers);
  return seededUsers.slice();
}

let runtimeUsers = loadData();

export function getUsers() {
  return runtimeUsers;
}

export function getUser(id: string) {
  return runtimeUsers.find((u) => u.id === id) ?? null;
}

export function verifyUser(id: string) {
  const u = getUser(id);
  if (!u) return null;
  u.isVerified = true;
  writeData(runtimeUsers);
  return u;
}

export function banUser(id: string, ban: boolean) {
  const u = getUser(id);
  if (!u) return null;
  u.banned = ban;
  writeData(runtimeUsers);
  return u;
}

export function getMetrics() {
  return {
    signupsThisWeek: 42,
    bannedUsers: runtimeUsers.filter((u) => u.banned).length,
    verificationPassRate: Math.round((runtimeUsers.filter((u) => u.isVerified).length / runtimeUsers.length) * 100),
  };
}

export function getActivityLog() {
  return [
    { timestamp: new Date().toISOString(), message: 'Seeded: user alice verified' },
    { timestamp: new Date().toISOString(), message: 'Seeded: user chloe uploaded photo' },
  ];
}
