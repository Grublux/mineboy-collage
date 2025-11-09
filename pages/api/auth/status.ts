import type { NextApiRequest, NextApiResponse } from 'next';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(200).json({ authenticated: false });
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jose.jwtVerify(token, secret);
      return res.status(200).json({ authenticated: true });
    } catch (error) {
      return res.status(200).json({ authenticated: false });
    }
  } catch (error) {
    return res.status(200).json({ authenticated: false });
  }
}
