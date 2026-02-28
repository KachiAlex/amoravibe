export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  isVerified?: boolean;
  banned?: boolean;
};

const seed: AdminUser[] = [
  { id: 'local-guest', email: 'guest@local', displayName: 'Local Guest' },
  { id: 'admin@amoravibe.com', email: 'admin@amoravibe.com', displayName: 'Site Admin' },
  { id: 'bob@example.com', email: 'bob@example.com', displayName: 'Bob' },
];

let usersMap: Record<string, AdminUser> = {};

function hydrateSeed() {
  usersMap = {};
  for (const u of seed) {
    usersMap[u.id] = { ...u };
  }
}

hydrateSeed();

export function resetAdminUsers(overrides?: Record<string, Partial<AdminUser>>) {
  hydrateSeed();
  if (overrides) {
    for (const [id, patch] of Object.entries(overrides)) {
      if (usersMap[id]) {
        usersMap[id] = { ...usersMap[id], ...patch };
      }
    }
  }
}

export function listUsers({ search, limit }: { search?: string; limit?: number } = {}) {
  let users = Object.values(usersMap);
  if (search) {
    const ql = search.toLowerCase();
    users = users.filter((u) => (u.email || '').toLowerCase().includes(ql) || (u.displayName || '').toLowerCase().includes(ql));
  }
  return { total: users.length, users: users.slice(0, limit || 20) };
}

export function getUser(id: string) {
  return usersMap[id] ? { ...usersMap[id] } : null;
}

export function verifyUser(id: string) {
  const u = usersMap[id];
  if (!u) return null;
  u.isVerified = true;
  return { ...u };
}

export function banUser(id: string, ban = true) {
  const u = usersMap[id];
  if (!u) return null;
  u.banned = !!ban;
  return { ...u };
}
