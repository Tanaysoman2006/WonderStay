import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { and, desc, eq, lte, or } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { bookings, listings, reviews, users } from '../db/schema.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';
import type { RatingsBreakdown } from '../types/index.ts';

const router = Router();

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const ratingFields: Array<keyof RatingsBreakdown> = ['cleanliness', 'accuracy', 'communication', 'location', 'checkIn', 'value'];

function isRatingsBreakdown(value: unknown): value is RatingsBreakdown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const scores = value as Record<string, unknown>;
  return ratingFields.every((field) => typeof scores[field] === 'number' && Number.isFinite(scores[field]) && scores[field] >= 1 && scores[field] <= 5);
}

function apiReview(review: typeof reviews.$inferSelect, author: typeof users.$inferSelect) {
  return {
    id: review.id,
    listingId: review.listingId,
    userId: review.userId,
    authorName: author.name,
    authorAvatar: author.avatar || '',
    authorLocation: review.authorLocation,
    rating: review.rating,
    date: review.date,
    stayDate: review.stayDate,
    comment: review.comment,
    ratingsBreakdown: review.ratingsBreakdown || undefined,
  };
}

async function refreshListingRating(listingId: string) {
  const listingReviews = await db.select().from(reviews).where(eq(reviews.listingId, listingId));
  const rating = listingReviews.length
    ? Number((listingReviews.reduce((sum, review) => sum + review.rating, 0) / listingReviews.length).toFixed(2))
    : 0;
  const averageBreakdown = (key: keyof RatingsBreakdown) => {
    const values = listingReviews
      .map((review) => review.ratingsBreakdown?.[key])
      .filter((value): value is number => typeof value === 'number');
    return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)) : 0;
  };
  const ratingsBreakdown: RatingsBreakdown = {
    cleanliness: averageBreakdown('cleanliness'),
    accuracy: averageBreakdown('accuracy'),
    communication: averageBreakdown('communication'),
    location: averageBreakdown('location'),
    checkIn: averageBreakdown('checkIn'),
    value: averageBreakdown('value'),
  };
  await db.update(listings).set({
    rating,
    reviewCount: listingReviews.length,
    ratingsBreakdown,
    updatedAt: new Date(),
  }).where(eq(listings.id, listingId));
}

async function loadReview(id: string) {
  const [result] = await db.select({ review: reviews, author: users })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.uid))
    .where(eq(reviews.id, id))
    .limit(1);
  return result ?? null;
}

async function findVerifiedStay(userId: string, listingId: string, stayDate?: string) {
  const today = new Date().toISOString().slice(0, 10);
  const conditions = [
    eq(bookings.guestId, userId),
    eq(bookings.listingId, listingId),
    lte(bookings.checkOut, today),
    or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'completed'))!,
  ];
  if (stayDate) conditions.push(eq(bookings.checkOut, stayDate));
  const [booking] = await db.select({ checkOut: bookings.checkOut })
    .from(bookings)
    .where(and(...conditions))
    .orderBy(desc(bookings.checkOut))
    .limit(1);
  return booking ?? null;
}

function fail(res: Response, error: unknown) {
  console.error('Reviews database request failed:', error);
  return res.status(503).json({ error: 'Reviews are temporarily unavailable.' });
}

router.get('/', async (_req, res: Response) => {
  try {
    const rows = await db.select({ review: reviews, author: users })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.uid));
    return res.json(rows.map(({ review, author }) => apiReview(review, author)));
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/listing/:listingId', async (req, res: Response) => {
  try {
    const rows = await db.select({ review: reviews, author: users })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.uid))
      .where(eq(reviews.listingId, req.params.listingId));
    return res.json(rows.map(({ review, author }) => apiReview(review, author)));
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/eligibility/:listingId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stay = await findVerifiedStay(req.user!.sub, req.params.listingId);
    const [existingReview] = await db.select({ id: reviews.id }).from(reviews)
      .where(and(eq(reviews.listingId, req.params.listingId), eq(reviews.userId, req.user!.sub)))
      .limit(1);
    return res.json({
      eligible: Boolean(stay) && !existingReview,
      stayDate: stay?.checkOut,
      alreadyReviewed: Boolean(existingReview),
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const result = await loadReview(req.params.id);
    if (!result) return res.status(404).json({ error: 'Review not found.' });
    return res.json(apiReview(result.review, result.author));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const listingId = typeof req.body?.listingId === 'string' ? req.body.listingId : '';
  const rating = Number(req.body?.rating);
  const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';
  const authorLocation = typeof req.body?.authorLocation === 'string' ? req.body.authorLocation.trim() : '';
  const stayDate = typeof req.body?.stayDate === 'string' ? req.body.stayDate : new Date().toISOString().slice(0, 10);
  const ratingsBreakdown = req.body?.ratingsBreakdown;

  if (!listingId || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5 || !isCalendarDate(stayDate)) {
    return res.status(400).json({ error: 'Provide a listing, a 1-5 integer rating, comment, and valid stay date.' });
  }
  if (ratingsBreakdown !== undefined && !isRatingsBreakdown(ratingsBreakdown)) {
    return res.status(400).json({ error: 'Rating breakdown values must be between 1 and 5.' });
  }

  try {
    const [listing] = await db.select({ id: listings.id }).from(listings)
      .where(eq(listings.id, listingId)).limit(1);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    const [author] = await db.select().from(users).where(eq(users.uid, req.user!.sub)).limit(1);
    if (!author) return res.status(401).json({ error: 'Authenticated user no longer exists.' });
    const verifiedStay = await findVerifiedStay(author.uid, listingId, stayDate);
    if (!verifiedStay) {
      return res.status(403).json({ error: 'Reviews can only be submitted after a completed stay at this listing.' });
    }

    const [created] = await db.insert(reviews).values({
      id: `review-${crypto.randomUUID()}`,
      listingId,
      userId: author.uid,
      authorLocation,
      rating,
      date: new Date().toISOString().slice(0, 10),
      stayDate: verifiedStay.checkOut,
      comment,
      ratingsBreakdown: ratingsBreakdown || null,
    }).returning();
    await refreshListingRating(listingId);
    return res.status(201).json(apiReview(created, author));
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this listing.' });
    }
    return fail(res, error);
  }
});

async function updateReview(req: AuthRequest, res: Response) {
  const current = await loadReview(req.params.id);
  if (!current) return res.status(404).json({ error: 'Review not found.' });
  if (current.review.userId !== req.user!.sub) {
    return res.status(403).json({ error: 'You can only edit your own review.' });
  }

  const patch: Partial<typeof reviews.$inferInsert> = { updatedAt: new Date() };
  if (req.body?.rating !== undefined) {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }
    patch.rating = rating;
  }
  if (req.body?.comment !== undefined) {
    if (typeof req.body.comment !== 'string' || !req.body.comment.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty.' });
    }
    patch.comment = req.body.comment.trim();
  }
  if (req.body?.ratingsBreakdown !== undefined) {
    const value = req.body.ratingsBreakdown;
    if (!isRatingsBreakdown(value)) {
      return res.status(400).json({ error: 'Rating breakdown values must be between 1 and 5.' });
    }
    patch.ratingsBreakdown = value;
  }

  const [updated] = await db.update(reviews).set(patch)
    .where(and(eq(reviews.id, current.review.id), eq(reviews.userId, req.user!.sub)))
    .returning();
  await refreshListingRating(current.review.listingId);
  return res.json(apiReview(updated, current.author));
}

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    return await updateReview(req, res);
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    return await updateReview(req, res);
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const current = await loadReview(req.params.id);
    if (!current) return res.status(404).json({ error: 'Review not found.' });
    const [listing] = await db.select({ hostId: listings.hostId }).from(listings)
      .where(eq(listings.id, current.review.listingId)).limit(1);
    if (current.review.userId !== req.user!.sub && listing?.hostId !== req.user!.sub) {
      return res.status(403).json({ error: 'Only the review author or listing host can remove this review.' });
    }
    await db.delete(reviews).where(eq(reviews.id, current.review.id));
    await refreshListingRating(current.review.listingId);
    return res.status(204).send();
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
