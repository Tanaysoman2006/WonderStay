import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: 'guest' | 'host';
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }
  return secret;
}

function encode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function sign(input: string): Buffer {
  return createHmac('sha256', getSecret()).update(input).digest();
}

export function createJWT(user: Pick<JWTPayload, 'sub' | 'name' | 'email' | 'role'>): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encode(JSON.stringify({ ...user, iat: now, exp: now + 60 * 60 * 24 * 7 }));
  const unsignedToken = `${header}.${payload}`;
  return `${unsignedToken}.${sign(unsignedToken).toString('base64url')}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8')) as { alg?: string; typ?: string };
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;

    const input = `${headerPart}.${payloadPart}`;
    const expected = sign(input);
    const supplied = Buffer.from(signaturePart, 'base64url');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Partial<JWTPayload>;
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'guest' && payload.role !== 'host') ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) return null;

    return payload as JWTPayload;
  } catch {
    return null;
  }
}
