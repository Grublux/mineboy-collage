import type { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import * as jose from 'jose';

const TOTP_SECRET = process.env.TOTP_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

if (!TOTP_SECRET) {
  console.error('TOTP_SECRET not configured');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    if (!TOTP_SECRET) {
      return res.status(500).json({ error: 'TOTP not configured' });
    }

    const verified = speakeasy.totp.verify({
      secret: TOTP_SECRET,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
