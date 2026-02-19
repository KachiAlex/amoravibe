import type { NextApiRequest, NextApiResponse } from 'next';

// Dev-only endpoint: expose whether dev env flags are set. Hidden when mocks are off or not in development.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development' || process.env.TRUST_API_MOCK !== '1') {
    return res.status(404).end('Not available');
  }

  return res.status(200).json({
    TRUST_API_MOCK: process.env.TRUST_API_MOCK ?? null,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ? 'set' : null,
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : null,
  });
}
