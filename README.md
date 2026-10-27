# WonderStay

WonderStay is a React/Vite accommodation marketplace backed by an Express REST API and PostgreSQL. The production Express process serves both the API and the built frontend.

## Local development

Prerequisites: Node.js, a package manager, and PostgreSQL.

1. Install dependencies with the package manager matching the lockfile.
2. Copy `.env.example` to `.env`, set the PostgreSQL credentials, and generate a unique `JWT_SECRET` of at least 32 characters.
3. Create the local PostgreSQL database, then run `npm run db:migrate` and `npm run db:seed`.
4. Start the API with `npm run server`. In another terminal, run `npm run dev`.

The Vite development server proxies `/api` requests to `http://localhost:3000`; production uses the same-origin `/api` path. Set `VITE_API_BASE_URL` only when the API is hosted on a different origin.

## Production deployment

Deploy as a Node.js web service using the repository root as the build context:

1. Install dependencies and run `npm run build`.
2. Run database migrations as a release/pre-deploy step with `npm run db:migrate`.
3. Start the web service with `npm start` and provide the platform's `PORT`.
4. Configure these server environment variables in the hosting provider's secret manager:
   - `DATABASE_URL` (or the `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, and `SQL_DB_NAME` fields)
   - `JWT_SECRET` (unique, randomly generated, 32+ characters)
   - `CORS_ORIGINS` only when a separate frontend origin needs API access
   - `SQL_SSL=true` when required by the managed database
5. Set `VITE_GOOGLE_MAPS_API_KEY` at build time if the map UI is enabled. Restrict this browser key by HTTP referrer and enabled APIs.
6. Leave `VITE_API_BASE_URL` unset or set it to `/api` when the Express process serves the frontend and API together.

Do not run `npm run db:seed` against production data. Keep development, preview, and production databases and credentials separate. Never commit `.env`, provider credentials, or database URLs. Any credential that was previously committed, shared, or included in an example file must be rotated; deleting it from the current file does not revoke it.

## Implemented behavior

- PostgreSQL schema for users, listings, bookings, reviews, and wishlists with Drizzle migrations. Wishlist interactions currently persist in the browser only.
- JWT registration/login and authenticated user, host ownership, and guest/host booking authorization.
- Server-filtered listing search, including price, capacity, property type, bedrooms, amenities, and date availability.
- Booking creation and date changes run in database transactions, lock the listing row, reject overlapping reservations, and calculate authoritative totals on the server.
- Reviews are limited to guests with a past completed stay; listing rating and category averages are recalculated from stored reviews.
- Host listings and reservations are loaded from API data scoped by the authenticated host; client demo data is not used for host dashboard fallbacks.
- API health check: `GET /api/health`.

## Routes

| Resource | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Listings | `GET /api/listings`, `GET /api/listings/:id`, `GET /api/listings/:id/availability`, `POST /api/listings`, `PUT/PATCH /api/listings/:id`, `DELETE /api/listings/:id` |
| Bookings | `GET /api/bookings`, `GET /api/bookings/:id`, `POST /api/bookings`, `PUT /api/bookings/:id`, `PATCH /api/bookings/:id/status`, `DELETE /api/bookings/:id` |
| Reviews | `GET /api/reviews`, `GET /api/reviews/:id`, `GET /api/reviews/listing/:listingId`, `GET /api/reviews/eligibility/:listingId`, `POST /api/reviews`, `PUT/PATCH /api/reviews/:id`, `DELETE /api/reviews/:id` |

## Payment status

The booking form currently uses a demo card interface and does not charge a real payment method. A payment provider account, server-side secret, webhook endpoint, and payment/refund workflow are required before accepting real payments. Do not collect or store real card numbers in this application.
