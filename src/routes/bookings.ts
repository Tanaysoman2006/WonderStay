import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { and, eq, gt, lt, ne, or } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { bookings, listings, users } from '../db/schema.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';

const router = Router();
const dayMs = 24 * 60 * 60 * 1000;

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const dateValue = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(dateValue.getTime()) && dateValue.toISOString().slice(0, 10) === value;
}

function guestCount(value: unknown) {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const adults = Number(source.adults ?? 1);
  const children = Number(source.children ?? 0);
  const infants = Number(source.infants ?? 0);
  if (![adults, children, infants].every(Number.isInteger) || adults < 1 || children < 0 || infants < 0) return null;
  return { adults, children, infants };
}

function toApiBooking(
  booking: typeof bookings.$inferSelect,
  listing: typeof listings.$inferSelect,
  guest: typeof users.$inferSelect,
) {
  return {
    id: booking.id,
    listingId: booking.listingId,
    listingTitle: listing.title,
    listingImage: listing.images[0] || '',
    listingCity: listing.city,
    listingCountry: listing.country,
    userId: booking.guestId,
    guestName: guest.name,
    guestEmail: guest.email,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    guestsCount: booking.guestsCount,
    pricePerNight: booking.pricePerNight,
    subtotal: booking.subtotal,
    cleaningFee: booking.cleaningFee,
    serviceFee: booking.serviceFee,
    taxes: booking.taxes,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  };
}

async function loadBooking(id: string) {
  const [result] = await db.select({ booking: bookings, listing: listings, guest: users })
    .from(bookings)
    .innerJoin(listings, eq(bookings.listingId, listings.id))
    .innerJoin(users, eq(bookings.guestId, users.uid))
    .where(eq(bookings.id, id))
    .limit(1);
  return result ?? null;
}

function fail(res: Response, error: unknown) {
  console.error('Bookings database request failed:', error);
  return res.status(503).json({ error: 'Bookings are temporarily unavailable.' });
}

function calculateAmounts(listing: typeof listings.$inferSelect, nights: number) {
  const subtotal = listing.price * nights;
  const serviceFee = Math.round(subtotal * listing.serviceFeePercent);
  const taxes = Math.round((subtotal + listing.cleaningFee + serviceFee) * 0.05);
  return {
    pricePerNight: listing.price,
    subtotal,
    cleaningFee: listing.cleaningFee,
    serviceFee,
    taxes,
    totalPrice: subtotal + listing.cleaningFee + serviceFee + taxes,
  };
}

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await db.select({ booking: bookings, listing: listings, guest: users })
      .from(bookings)
      .innerJoin(listings, eq(bookings.listingId, listings.id))
      .innerJoin(users, eq(bookings.guestId, users.uid))
      .where(or(eq(bookings.guestId, req.user!.sub), eq(listings.hostId, req.user!.sub)));
    return res.json(rows.map(({ booking, listing, guest }) => toApiBooking(booking, listing, guest)));
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await loadBooking(req.params.id);
    if (!result) return res.status(404).json({ error: 'Booking not found.' });
    if (result.booking.guestId !== req.user!.sub && result.listing.hostId !== req.user!.sub) {
      return res.status(403).json({ error: 'You are not allowed to view this booking.' });
    }
    return res.json(toApiBooking(result.booking, result.listing, result.guest));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const listingId = typeof req.body?.listingId === 'string' ? req.body.listingId : '';
  const checkIn = req.body?.checkIn;
  const checkOut = req.body?.checkOut;
  const guestsCount = guestCount(req.body?.guestsCount);

  if (!listingId || !isIsoDate(checkIn) || !isIsoDate(checkOut) || checkIn >= checkOut || !guestsCount) {
    return res.status(400).json({ error: 'Provide a listing, valid date range, and valid guest counts.' });
  }
  if (checkIn < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ error: 'Check-in must be today or a future date.' });
  }
  const validGuestsCount = guestsCount;

  try {
    const result = await db.transaction(async (tx) => {
      const [listing] = await tx.select().from(listings)
        .where(eq(listings.id, listingId))
        .for('update');
      if (!listing) return { ok: false as const, error: 'Listing not found.', status: 404 };
      if (validGuestsCount.adults + validGuestsCount.children > listing.maxGuests) {
        return { ok: false as const, error: 'Guest count exceeds the listing capacity.', status: 400 };
      }
      const [conflict] = await tx.select({ id: bookings.id }).from(bookings)
        .where(and(
          eq(bookings.listingId, listingId),
          eq(bookings.status, 'confirmed'),
          lt(bookings.checkIn, checkOut),
          gt(bookings.checkOut, checkIn),
        ))
        .limit(1);
      if (conflict) return { ok: false as const, error: 'Selected dates overlap with an existing reservation.', status: 409 };

      const [guest] = await tx.select().from(users).where(eq(users.uid, req.user!.sub)).limit(1);
      if (!guest) return { ok: false as const, error: 'Authenticated user no longer exists.', status: 401 };
      const nights = (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / dayMs;
      const [created] = await tx.insert(bookings).values({
        id: `booking-${crypto.randomUUID()}`,
        listingId,
        guestId: req.user!.sub,
        checkIn,
        checkOut,
        nights,
        guestsCount: validGuestsCount,
        ...calculateAmounts(listing, nights),
      }).returning();
      return { ok: true as const, created, listing, guest };
    });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(201).json(toApiBooking(result.created, result.listing, result.guest));
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const checkIn = req.body?.checkIn;
  const checkOut = req.body?.checkOut;
  const guestsCount = guestCount(req.body?.guestsCount);
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkIn >= checkOut || !guestsCount) {
    return res.status(400).json({ error: 'Provide a valid date range and guest counts.' });
  }
  if (checkIn < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ error: 'Check-in must be today or a future date.' });
  }
  const validGuestsCount = guestsCount;

  try {
    const result = await db.transaction(async (tx) => {
      const [existing] = await tx.select({ booking: bookings, listing: listings, guest: users })
        .from(bookings)
        .innerJoin(listings, eq(bookings.listingId, listings.id))
        .innerJoin(users, eq(bookings.guestId, users.uid))
        .where(eq(bookings.id, req.params.id))
        .limit(1);
      if (!existing) return { ok: false as const, error: 'Booking not found.', status: 404 };
      const [listing] = await tx.select().from(listings)
        .where(eq(listings.id, existing.listing.id))
        .for('update');
      if (!listing) return { ok: false as const, error: 'Listing not found.', status: 404 };
      if (existing.booking.guestId !== req.user!.sub) {
        return { ok: false as const, error: 'Only the booking guest can update this booking.', status: 403 };
      }
      if (existing.booking.status !== 'confirmed' || existing.booking.checkIn <= new Date().toISOString().slice(0, 10)) {
        return { ok: false as const, error: 'This booking can no longer be changed.', status: 409 };
      }
      if (validGuestsCount.adults + validGuestsCount.children > listing.maxGuests) {
        return { ok: false as const, error: 'Guest count exceeds the listing capacity.', status: 400 };
      }
      const [conflict] = await tx.select({ id: bookings.id }).from(bookings)
        .where(and(
          eq(bookings.listingId, existing.booking.listingId),
          eq(bookings.status, 'confirmed'),
          lt(bookings.checkIn, checkOut),
          gt(bookings.checkOut, checkIn),
          ne(bookings.id, existing.booking.id),
        ))
        .limit(1);
      if (conflict) return { ok: false as const, error: 'Selected dates overlap with an existing reservation.', status: 409 };

      const nights = (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / dayMs;
      const [updated] = await tx.update(bookings).set({
        checkIn,
        checkOut,
        nights,
        guestsCount: validGuestsCount,
        ...calculateAmounts(listing, nights),
        updatedAt: new Date(),
      }).where(eq(bookings.id, existing.booking.id)).returning();
      return { ok: true as const, updated, listing, guest: existing.guest };
    });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.json(toApiBooking(result.updated, result.listing, result.guest));
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.body?.status !== 'cancelled') {
    return res.status(400).json({ error: 'Bookings may only be cancelled through this endpoint.' });
  }
  try {
    const current = await loadBooking(req.params.id);
    if (!current) return res.status(404).json({ error: 'Booking not found.' });
    if (current.booking.guestId !== req.user!.sub && current.listing.hostId !== req.user!.sub) {
      return res.status(403).json({ error: 'You are not allowed to cancel this booking.' });
    }
    if (current.booking.status !== 'confirmed') {
      return res.status(409).json({ error: 'Only confirmed bookings can be cancelled.' });
    }
    const [updated] = await db.update(bookings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(bookings.id, current.booking.id))
      .returning();
    return res.json(toApiBooking(updated, current.listing, current.guest));
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const current = await loadBooking(req.params.id);
    if (!current) return res.status(404).json({ error: 'Booking not found.' });
    if (current.booking.guestId !== req.user!.sub && current.listing.hostId !== req.user!.sub) {
      return res.status(403).json({ error: 'You are not allowed to delete this booking.' });
    }
    await db.delete(bookings).where(eq(bookings.id, current.booking.id));
    return res.status(204).send();
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
