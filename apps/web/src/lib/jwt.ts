import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const SECRET = process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me';
const encoder = new TextEncoder();
const key = encoder.encode(SECRET);

export async function signToken(payload: Record<string, unknown>, expiresIn: string | number = '30d') {
  // expiresIn accepts a string like '30d' for jose
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(typeof expiresIn === 'string' ? expiresIn : `${expiresIn}s`)
    .sign(key);
  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as JWTPayload;
  } catch (err) {
    return null;
  }
}
