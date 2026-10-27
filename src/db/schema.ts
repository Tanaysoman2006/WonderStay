import { relations, sql } from 'drizzle-orm';
import type { RatingsBreakdown } from '../types/index.ts';
import {
  boolean,
  check,
  date,
  doublePrecision,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default('Traveler'),
  role: text('role').notNull().default('guest'),
  avatar: text('avatar'),
  passwordHash: text('password_hash').notNull().default('!'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  roleCheck: check('users_role_check', sql`${table.role} in ('guest', 'host')`),
}));

export const listings = pgTable('listings', {
  id: text('id').primaryKey(),
  hostId: text('host_id').notNull().references(() => users.uid, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  tagline: text('tagline').notNull().default(''),
  description: text('description').notNull(),
  category: text('category').notNull(),
  propertyType: text('property_type').notNull(),
  roomType: text('room_type').notNull().default('Entire place'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull().default(''),
  country: text('country').notNull(),
  neighborhood: text('neighborhood').notNull().default(''),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  price: integer('price').notNull(),
  cleaningFee: integer('cleaning_fee').notNull().default(0),
  serviceFeePercent: doublePrecision('service_fee_percent').notNull().default(0.12),
  maxGuests: integer('max_guests').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  beds: integer('beds').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  rating: doublePrecision('rating').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  images: json('images').$type<string[]>().notNull().default([]),
  amenities: json('amenities').$type<string[]>().notNull().default([]),
  ratingsBreakdown: json('ratings_breakdown').$type<RatingsBreakdown>().notNull().default({
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    location: 0,
    checkIn: 0,
    value: 0,
  }),
  houseRules: json('house_rules').$type<string[]>().notNull().default([]),
  cancellationPolicy: text('cancellation_policy').notNull().default(''),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  priceCheck: check('listings_price_check', sql`${table.price} > 0`),
  cleaningFeeCheck: check('listings_cleaning_fee_check', sql`${table.cleaningFee} >= 0`),
  serviceFeeCheck: check('listings_service_fee_check', sql`${table.serviceFeePercent} between 0 and 1`),
  guestLimitCheck: check('listings_max_guests_check', sql`${table.maxGuests} > 0`),
  bedroomsCheck: check('listings_bedrooms_check', sql`${table.bedrooms} >= 0`),
  bedsCheck: check('listings_beds_check', sql`${table.beds} > 0`),
  bathroomsCheck: check('listings_bathrooms_check', sql`${table.bathrooms} > 0`),
  ratingCheck: check('listings_rating_check', sql`${table.rating} between 0 and 5`),
  reviewCountCheck: check('listings_review_count_check', sql`${table.reviewCount} >= 0`),
  locationCheck: check('listings_coordinates_check', sql`${table.lat} between -90 and 90 and ${table.lng} between -180 and 180`),
}));

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').notNull().references(() => listings.id, { onDelete: 'restrict' }),
  guestId: text('guest_id').notNull().references(() => users.uid, { onDelete: 'restrict' }),
  checkIn: date('check_in', { mode: 'string' }).notNull(),
  checkOut: date('check_out', { mode: 'string' }).notNull(),
  nights: integer('nights').notNull(),
  guestsCount: json('guests_count').$type<{ adults: number; children: number; infants: number }>().notNull(),
  pricePerNight: integer('price_per_night').notNull(),
  subtotal: integer('subtotal').notNull(),
  cleaningFee: integer('cleaning_fee').notNull(),
  serviceFee: integer('service_fee').notNull(),
  taxes: integer('taxes').notNull(),
  totalPrice: integer('total_price').notNull(),
  status: text('status').notNull().default('confirmed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  dateRangeCheck: check('bookings_date_range_check', sql`${table.checkIn} < ${table.checkOut}`),
  nightsCheck: check('bookings_nights_check', sql`${table.nights} > 0`),
  moneyCheck: check('bookings_money_check', sql`${table.pricePerNight} >= 0 and ${table.subtotal} >= 0 and ${table.cleaningFee} >= 0 and ${table.serviceFee} >= 0 and ${table.taxes} >= 0 and ${table.totalPrice} >= 0`),
  statusCheck: check('bookings_status_check', sql`${table.status} in ('confirmed', 'cancelled', 'completed')`),
}));

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  authorLocation: text('author_location').notNull().default(''),
  rating: integer('rating').notNull(),
  date: text('date').notNull(),
  stayDate: text('stay_date').notNull(),
  comment: text('comment').notNull(),
  ratingsBreakdown: json('ratings_breakdown').$type<RatingsBreakdown>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  ratingCheck: check('reviews_rating_check', sql`${table.rating} between 1 and 5`),
  listingReviewerUnique: uniqueIndex('reviews_listing_user_unique').on(table.listingId, table.userId),
}));

export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  listingId: text('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userListingUnique: uniqueIndex('wishlists_user_listing_unique').on(table.userId, table.listingId),
}));

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  bookings: many(bookings),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  host: one(users, { fields: [listings.hostId], references: [users.uid] }),
  bookings: many(bookings),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  listing: one(listings, { fields: [bookings.listingId], references: [listings.id] }),
  guest: one(users, { fields: [bookings.guestId], references: [users.uid] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  listing: one(listings, { fields: [reviews.listingId], references: [listings.id] }),
  author: one(users, { fields: [reviews.userId], references: [users.uid] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.uid] }),
  listing: one(listings, { fields: [wishlists.listingId], references: [listings.id] }),
}));
