import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { createJWT } from '../utils/serverJwt.ts';

const router = Router();
const PASSWORD_ITERATIONS = 150_000;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const digest = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 64, 'sha512').toString('hex');
  return `${salt}:${digest}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;

  const candidate = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 64, 'sha512');
  const expected = Buffer.from(digest, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function publicUser(user: typeof users.$inferSelect) {
  return {
    id: user.uid,
    name: user.name,
    email: user.email,
    role: user.role === 'host' ? 'host' as const : 'guest' as const,
    avatar: user.avatar || '',
  };
}

function issueToken(user: typeof users.$inferSelect): string {
  return createJWT({
    sub: user.uid,
    name: user.name,
    email: user.email,
    role: user.role === 'host' ? 'host' : 'guest',
  });
}

router.post('/register', async (req, res: Response) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const requestedRole = req.body?.role;

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Provide a name, valid email, and password of at least 8 characters.' });
  }
  if (requestedRole !== undefined && requestedRole !== 'guest' && requestedRole !== 'host') {
    return res.status(400).json({ error: 'Role must be guest or host.' });
  }

  try {
    const [user] = await db.insert(users).values({
      uid: crypto.randomUUID(),
      name,
      email,
      role: requestedRole || 'guest',
      passwordHash: hashPassword(password),
    }).returning();

    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error('Registration failed:', error);
    return res.status(503).json({ error: 'Account registration is temporarily unavailable.' });
  }
});

router.post('/login', async (req, res: Response) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(503).json({ error: 'Login is temporarily unavailable.' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.uid, req.user!.sub)).limit(1);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Could not load authenticated user:', error);
    return res.status(503).json({ error: 'User profile is temporarily unavailable.' });
  }
});

export default router;
