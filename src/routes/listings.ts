import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { and, eq, gt, gte, ilike, inArray, lte, lt, or } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { bookings, listings, users } from '../db/schema.ts';
import { AuthRequest, requireAuth, requireHost } from '../middleware/auth.ts';
import type { RatingsBreakdown } from '../types/index.ts';

const router = Router();

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function number(value: unknown, fallback?: number): number | undefined {
  if (value === undefined && fallback !== undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const ratingFields: Array<keyof RatingsBreakdown> = ['cleanliness', 'accuracy', 'communication', 'location', 'checkIn', 'value'];

function validRatingsBreakdown(value: unknown): value is RatingsBreakdown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const scores = value as Record<string, unknown>;
  return ratingFields.every((field) => typeof scores[field] === 'number' && Number.isFinite(scores[field]) && scores[field] >= 0 && scores[field] <= 5);
}

function apiListing(listing: typeof listings.$inferSelect, host: typeof users.$inferSelect | null) {
  return {
    id: listing.id,
    title: listing.title,
    tagline: listing.tagline,
    description: listing.description,
    category: listing.category,
    propertyType: listing.propertyType,
    roomType: listing.roomType,
    location: {
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      lat: listing.lat,
      lng: listing.lng,
      neighborhood: listing.neighborhood,
    },
    price: listing.price,
    cleaningFee: listing.cleaningFee,
    serviceFeePercent: listing.serviceFeePercent,
    maxGuests: listing.maxGuests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
    amenities: listing.amenities,
    images: listing.images,
    host: {
      id: host?.uid || listing.hostId,
      name: host?.name || 'Host',
      avatar: host?.avatar || '',
      superhost: false,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: host?.createdAt.getFullYear().toString() || '',
    },
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    ratingsBreakdown: listing.ratingsBreakdown,
    houseRules: listing.houseRules,
    cancellationPolicy: listing.cancellationPolicy,
    isFeatured: listing.isFeatured,
    createdAt: listing.createdAt.toISOString().slice(0, 10),
  };
}

async function getListing(id: string) {
  const [result] = await db.select({ listing: listings, host: users })
    .from(listings)
    .leftJoin(users, eq(listings.hostId, users.uid))
    .where(eq(listings.id, id))
    .limit(1);
  return result ?? null;
}

function databaseUnavailable(res: Response, error: unknown) {
  console.error('Listings database request failed:', error);
  return res.status(503).json({ error: 'Listings are temporarily unavailable.' });
}

router.get('/', async (req, res: Response) => {
  const conditions = [];
  const category = text(req.query.category);
  const search = text(req.query.search);
  const city = text(req.query.city);
  const minPrice = number(req.query.minPrice);
  const maxPrice = number(req.query.maxPrice);
  const minGuests = number(req.query.guests);
  const minBedrooms = number(req.query.bedrooms);
  const propertyType = text(req.query.propertyType);
  const checkIn = text(req.query.checkIn);
  const checkOut = text(req.query.checkOut);
  const amenities = text(req.query.amenities).split(',').map((amenity) => amenity.trim()).filter(Boolean);

  const isDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if ((checkIn || checkOut) && (!checkIn || !checkOut || !isDate(checkIn) || !isDate(checkOut) || checkIn >= checkOut)) {
    return res.status(400).json({ error: 'Provide a valid check-in and check-out date range.' });
  }

  if (category && category !== 'All') conditions.push(eq(listings.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(
      ilike(listings.title, pattern),
      ilike(listings.description, pattern),
      ilike(listings.city, pattern),
      ilike(listings.country, pattern),
      ilike(listings.address, pattern),
      ilike(listings.neighborhood, pattern),
    )!);
  }
  if (city) conditions.push(ilike(listings.city, `%${city}%`));
  if (minPrice !== undefined) conditions.push(gte(listings.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(listings.price, maxPrice));
  if (minGuests !== undefined) conditions.push(gte(listings.maxGuests, minGuests));
  if (minBedrooms !== undefined) conditions.push(gte(listings.bedrooms, minBedrooms));
  if (propertyType) {
    conditions.push(or(
      eq(listings.roomType, propertyType),
      ilike(listings.propertyType, `%${propertyType}%`),
    )!);
  }

  try {
    const rows = await db.select({ listing: listings, host: users })
      .from(listings)
      .leftJoin(users, eq(listings.hostId, users.uid))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(listings.createdAt);
    let results = rows.filter(({ listing }) =>
      amenities.every((amenity: string) => listing.amenities.includes(amenity))
    );
    if (checkIn && checkOut && results.length) {
      const overlapping = await db.select({ listingId: bookings.listingId })
        .from(bookings)
        .where(and(
          inArray(bookings.listingId, results.map(({ listing }) => listing.id)),
          eq(bookings.status, 'confirmed'),
          lt(bookings.checkIn, checkOut),
          gt(bookings.checkOut, checkIn),
        ));
      const unavailable = new Set(overlapping.map(({ listingId }) => listingId));
      results = results.filter(({ listing }) => !unavailable.has(listing.id));
    }
    return res.json(results.map(({ listing, host }) => apiListing(listing, host)));
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.get('/:id/availability', async (req, res: Response) => {
  const checkIn = text(req.query.checkIn);
  const checkOut = text(req.query.checkOut);
  const isDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!isDate(checkIn) || !isDate(checkOut) || checkIn >= checkOut) {
    return res.status(400).json({ error: 'Provide a valid check-in and check-out date range.' });
  }
  try {
    const [listing] = await db.select({ id: listings.id }).from(listings)
      .where(eq(listings.id, req.params.id)).limit(1);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    const [conflict] = await db.select({
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
    }).from(bookings)
      .where(and(
        eq(bookings.listingId, req.params.id),
        eq(bookings.status, 'confirmed'),
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn),
      ))
      .limit(1);
    return res.json({ available: !conflict, conflict });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const result = await getListing(req.params.id);
    if (!result) return res.status(404).json({ error: 'Listing not found.' });
    return res.json(apiListing(result.listing, result.host));
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.post('/', requireAuth, requireHost, async (req: AuthRequest, res: Response) => {
  const payload = req.body ?? {};
  const location = payload.location ?? {};
  const price = number(payload.price);
  const maxGuests = number(payload.maxGuests);
  const bedrooms = number(payload.bedrooms);
  const beds = number(payload.beds);
  const bathrooms = number(payload.bathrooms);
  const lat = number(location.lat);
  const lng = number(location.lng);
  const cleaningFee = number(payload.cleaningFee, 0);
  const serviceFeePercent = number(payload.serviceFeePercent, 0.12);

  if (
    !text(payload.title) || !text(payload.description) || !text(payload.category) ||
    !text(payload.propertyType) || !text(location.address) || !text(location.city) ||
    !text(location.country) || price === undefined || price <= 0 ||
    maxGuests === undefined || maxGuests < 1 ||
    bedrooms === undefined || bedrooms < 0 ||
    beds === undefined || beds < 1 ||
    bathrooms === undefined || bathrooms < 1 ||
    !Number.isInteger(price) || !Number.isInteger(cleaningFee) ||
    !Number.isInteger(maxGuests) || !Number.isInteger(bedrooms) ||
    !Number.isInteger(beds) || !Number.isInteger(bathrooms) ||
    lat === undefined || lat < -90 || lat > 90 ||
    lng === undefined || lng < -180 || lng > 180 ||
    cleaningFee === undefined || cleaningFee < 0 ||
    serviceFeePercent === undefined || serviceFeePercent < 0 || serviceFeePercent > 1 ||
    !Array.isArray(payload.images) || !Array.isArray(payload.amenities)
    || !payload.images.every((image: unknown) => typeof image === 'string')
    || !payload.amenities.every((amenity: unknown) => typeof amenity === 'string')
    || (payload.ratingsBreakdown !== undefined && !validRatingsBreakdown(payload.ratingsBreakdown))
  ) {
    return res.status(400).json({ error: 'Listing fields are missing or invalid.' });
  }

  const id = `stay-${crypto.randomUUID()}`;
  try {
    const [created] = await db.insert(listings).values({
      id,
      hostId: req.user!.sub,
      title: text(payload.title),
      tagline: text(payload.tagline),
      description: text(payload.description),
      category: text(payload.category),
      propertyType: text(payload.propertyType),
      roomType: text(payload.roomType, 'Entire place'),
      address: text(location.address),
      city: text(location.city),
      state: text(location.state),
      country: text(location.country),
      neighborhood: text(location.neighborhood),
      lat,
      lng,
      price,
      cleaningFee,
      serviceFeePercent,
      maxGuests,
      bedrooms,
      beds,
      bathrooms,
      images: payload.images,
      amenities: payload.amenities,
      ratingsBreakdown: payload.ratingsBreakdown || {
        cleanliness: 0,
        accuracy: 0,
        communication: 0,
        location: 0,
        checkIn: 0,
        value: 0,
      },
      houseRules: Array.isArray(payload.houseRules) ? payload.houseRules : [],
      cancellationPolicy: text(payload.cancellationPolicy),
      isFeatured: payload.isFeatured === true,
    }).returning();
    const result = await getListing(created.id);
    return res.status(201).json(apiListing(created, result?.host ?? null));
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

async function updateListing(req: AuthRequest, res: Response) {
  const current = await getListing(req.params.id);
  if (!current) return res.status(404).json({ error: 'Listing not found.' });
  if (current.listing.hostId !== req.user!.sub) {
    return res.status(403).json({ error: 'You can only change listings that you host.' });
  }

  const payload = req.body ?? {};
  const location = payload.location ?? {};
  const patch: Partial<typeof listings.$inferInsert> = { updatedAt: new Date() };
  const stringFields = ['title', 'tagline', 'description', 'category', 'propertyType', 'roomType', 'cancellationPolicy'] as const;
  for (const field of stringFields) {
    if (payload[field] !== undefined) {
      if (typeof payload[field] !== 'string' || !payload[field].trim()) {
        return res.status(400).json({ error: `${field} must be a non-empty string.` });
      }
      patch[field] = payload[field].trim();
    }
  }
  const locationFields = { address: 'address', city: 'city', state: 'state', country: 'country', neighborhood: 'neighborhood' } as const;
  for (const [input, column] of Object.entries(locationFields) as Array<[keyof typeof locationFields, typeof locationFields[keyof typeof locationFields]]>) {
    if (location[input] !== undefined) patch[column] = text(location[input]);
  }
  for (const field of ['lat', 'lng', 'price', 'cleaningFee', 'serviceFeePercent', 'maxGuests', 'bedrooms', 'beds', 'bathrooms'] as const) {
    const value = number(payload[field]);
    if (payload[field] !== undefined) {
      const invalidRange = value === undefined ||
        (field === 'price' && value <= 0) ||
        (field === 'cleaningFee' && value < 0) ||
        (field === 'serviceFeePercent' && (value < 0 || value > 1)) ||
        (field === 'maxGuests' && value < 1) ||
        (field === 'bedrooms' && value < 0) ||
        (['beds', 'bathrooms'].includes(field) && value < 1) ||
        (field === 'lat' && (value < -90 || value > 90)) ||
        (field === 'lng' && (value < -180 || value > 180)) ||
        (['price', 'cleaningFee', 'maxGuests', 'bedrooms', 'beds', 'bathrooms'].includes(field) && value !== undefined && !Number.isInteger(value));
      if (invalidRange) {
        return res.status(400).json({ error: `${field} must be a valid number.` });
      }
      patch[field] = value;
    }
  }
  for (const field of ['images', 'amenities', 'houseRules'] as const) {
    if (payload[field] !== undefined) {
      if (!Array.isArray(payload[field])) return res.status(400).json({ error: `${field} must be an array.` });
      if (!payload[field].every((entry: unknown) => typeof entry === 'string')) {
        return res.status(400).json({ error: `${field} values must be strings.` });
      }
      patch[field] = payload[field];
    }
  }
  if (payload.ratingsBreakdown !== undefined) {
    if (!validRatingsBreakdown(payload.ratingsBreakdown)) {
      return res.status(400).json({ error: 'Rating breakdown values must be between 0 and 5.' });
    }
    patch.ratingsBreakdown = payload.ratingsBreakdown;
  }
  if (payload.isFeatured !== undefined) patch.isFeatured = payload.isFeatured === true;

  const [updated] = await db.update(listings).set(patch).where(eq(listings.id, req.params.id)).returning();
  return res.json(apiListing(updated, current.host));
}

router.put('/:id', requireAuth, requireHost, async (req: AuthRequest, res: Response) => {
  try {
    return await updateListing(req, res);
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.patch('/:id', requireAuth, requireHost, async (req: AuthRequest, res: Response) => {
  try {
    return await updateListing(req, res);
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.delete('/:id', requireAuth, requireHost, async (req: AuthRequest, res: Response) => {
  try {
    const [listing] = await db.select({ hostId: listings.hostId }).from(listings)
      .where(eq(listings.id, req.params.id)).limit(1);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.hostId !== req.user!.sub) {
      return res.status(403).json({ error: 'You can only remove listings that you host.' });
    }
    const [existingBooking] = await db.select({ id: bookings.id }).from(bookings)
      .where(eq(bookings.listingId, req.params.id))
      .limit(1);
    if (existingBooking) {
      return res.status(409).json({ error: 'Listings with booking history cannot be deleted.' });
    }
    await db.delete(listings).where(eq(listings.id, req.params.id));
    return res.status(204).send();
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

export default router;
