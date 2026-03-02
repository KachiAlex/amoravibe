import { verifyToken } from '@/lib/jwt';

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies['auth-token'];
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload?.userId ? (payload.userId as string) : null;
  } catch (err) {
    return null;
  }
}
