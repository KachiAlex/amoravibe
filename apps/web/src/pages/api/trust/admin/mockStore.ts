import { randomUUID } from 'crypto';

export type MockUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  banned: boolean;
};

export type CreateUserInput = {
  id?: string;
  email: string;
  displayName?: string;
  role?: string;
  isVerified?: boolean;
  banned?: boolean;
};

const mockUsers = new Map<string, MockUser>();

const defaultUsers: CreateUserInput[] = [
  {
    id: 'admin-demo-user',
    email: 'admin@amoravibe.com',
    displayName: 'Amoravibe Admin',
    role: 'admin',
    isVerified: true,
  },
  {
    id: 'demo-user-1',
    email: 'demo@amoravibe.com',
    displayName: 'Demo User',
    role: 'user',
    isVerified: true,
  },
];

for (const user of defaultUsers) {
  upsertUser(user);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toMockUser(input: CreateUserInput): MockUser {
  return {
    id: input.id ?? randomUUID(),
    email: normalizeEmail(input.email),
    displayName: input.displayName ?? input.email.split('@')[0],
    role: input.role ?? 'user',
    isVerified: input.isVerified ?? false,
    banned: input.banned ?? false,
  };
}

function upsertUser(input: CreateUserInput) {
  const user = toMockUser(input);
  mockUsers.set(normalizeEmail(user.email), user);
  return user;
}

export function createUser(input: CreateUserInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = mockUsers.get(normalizedEmail);
  if (existing) return existing;

  return upsertUser({ ...input, email: normalizedEmail });
}

export function findUserByEmail(email?: string | null) {
  if (!email) return null;
  return mockUsers.get(normalizeEmail(email)) ?? null;
}

export function getUsers() {
  return Array.from(mockUsers.values());
}
