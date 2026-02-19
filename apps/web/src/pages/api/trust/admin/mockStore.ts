export type MockUser = {
  id: string;
  email: string;
  displayName: string;
  role?: string;
  isVerified?: boolean;
  banned?: boolean;
};

let mockUsers: MockUser[] = [
  { id: 'user_1', email: 'admin@amoravibe.com', displayName: 'Admin', role: 'admin', isVerified: true, banned: false },
  { id: 'user_2', email: 'alice@example.com', displayName: 'Alice', role: 'user', isVerified: false, banned: false },
  { id: 'user_3', email: 'bob@example.com', displayName: 'Bob', role: 'user', isVerified: true, banned: false },
  { id: 'user_4', email: 'carol@example.com', displayName: 'Carol', role: 'user', isVerified: false, banned: true },
  { id: 'user_5', email: 'dave@example.com', displayName: 'Dave', role: 'user', isVerified: true, banned: false },
];

export function getUsers() {
  return mockUsers;
}

export function findUser(id: string) {
  return mockUsers.find((u) => u.id === id) ?? null;
}

export function findUserByEmail(email: string) {
  return mockUsers.find((u) => u.email === email) ?? null;
}

export function createUser(user: Partial<MockUser>) {
  const id = user.id ?? `user_${Math.random().toString(36).slice(2, 9)}`;
  const newUser: MockUser = {
    id,
    email: user.email ?? `user+${id}@local`,
    displayName: user.displayName ?? (user.email ? user.email.split('@')[0] : id),
    role: user.role ?? 'user',
    isVerified: user.isVerified ?? false,
    banned: user.banned ?? false,
  };
  mockUsers.unshift(newUser);
  return newUser;
}

export function updateUser(id: string, patch: Partial<MockUser>) {
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  mockUsers[idx] = { ...mockUsers[idx], ...patch };
  return mockUsers[idx];
}

export function resetMockUsers(users: MockUser[]) {
  mockUsers = users;
}
