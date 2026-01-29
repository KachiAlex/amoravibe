import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const PASSWORD_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, PASSWORD_KEYLEN).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) {
    return false;
  }

  const [salt, hexHash] = storedHash.split(':');
  if (!salt || !hexHash) {
    return false;
  }

  const derived = scryptSync(password, salt, PASSWORD_KEYLEN);
  const storedBuffer = Buffer.from(hexHash, 'hex');

  if (storedBuffer.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(derived, storedBuffer);
}
