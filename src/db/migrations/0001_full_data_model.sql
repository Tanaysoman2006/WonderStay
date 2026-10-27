CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  uid text NOT NULL UNIQUE,
  email text NOT NULL,
  name text NOT NULL DEFAULT 'Traveler',
  role text NOT NULL DEFAULT 'guest',
  avatar text,
  password_hash text NOT NULL DEFAULT '!',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_role_check CHECK (role IN ('guest', 'host'))
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text NOT NULL DEFAULT '!';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE users SET password_hash = '!' WHERE password_hash IS NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);

CREATE TABLE IF NOT EXISTS listings (
  id text PRIMARY KEY,
  host_id text NOT NULL,
  title text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL,
  category text NOT NULL,
  property_type text NOT NULL,
  room_type text NOT NULL DEFAULT 'Entire place',
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL DEFAULT '',
  country text NOT NULL,
  neighborhood text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  cleaning_fee integer NOT NULL DEFAULT 0,
  service_fee_percent double precision NOT NULL DEFAULT 0.12,
  max_guests integer NOT NULL CHECK (max_guests > 0),
  bedrooms integer NOT NULL DEFAULT 0,
  beds integer NOT NULL DEFAULT 1,
  bathrooms integer NOT NULL DEFAULT 1,
  rating double precision NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  images json NOT NULL DEFAULT '[]'::json,
  amenities json NOT NULL DEFAULT '[]'::json,
  ratings_breakdown json NOT NULL DEFAULT '{}'::json,
  house_rules json NOT NULL DEFAULT '[]'::json,
  cancellation_policy text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listings_price_check CHECK (price > 0),
  CONSTRAINT listings_cleaning_fee_check CHECK (cleaning_fee >= 0),
  CONSTRAINT listings_service_fee_check CHECK (service_fee_percent BETWEEN 0 AND 1),
  CONSTRAINT listings_max_guests_check CHECK (max_guests > 0),
  CONSTRAINT listings_bedrooms_check CHECK (bedrooms >= 0),
  CONSTRAINT listings_beds_check CHECK (beds > 0),
  CONSTRAINT listings_bathrooms_check CHECK (bathrooms > 0),
  CONSTRAINT listings_rating_check CHECK (rating BETWEEN 0 AND 5),
  CONSTRAINT listings_review_count_check CHECK (review_count >= 0),
  CONSTRAINT listings_coordinates_check CHECK (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180)
);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS room_type text NOT NULL DEFAULT 'Entire place';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS neighborhood text NOT NULL DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_fee_percent double precision NOT NULL DEFAULT 0.12;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ratings_breakdown json NOT NULL DEFAULT '{}'::json;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS house_rules json NOT NULL DEFAULT '[]'::json;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cancellation_policy text NOT NULL DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

INSERT INTO users (uid, email, name, role, password_hash)
SELECT DISTINCT host_id, 'legacy+' || md5(host_id) || '@wonderstay.invalid', 'Legacy Host', 'host', '!'
FROM listings
WHERE host_id IS NOT NULL
ON CONFLICT (uid) DO NOTHING;

CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  listing_id text NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  guest_id text NOT NULL REFERENCES users(uid) ON DELETE RESTRICT,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights integer NOT NULL CHECK (nights > 0),
  guests_count json NOT NULL DEFAULT '{"adults":1,"children":0,"infants":0}'::json,
  price_per_night integer NOT NULL,
  subtotal integer NOT NULL,
  cleaning_fee integer NOT NULL DEFAULT 0,
  service_fee integer NOT NULL DEFAULT 0,
  taxes integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_date_range_check CHECK (check_in < check_out),
  CONSTRAINT bookings_nights_check CHECK (nights > 0),
  CONSTRAINT bookings_money_check CHECK (
    price_per_night >= 0 AND subtotal >= 0 AND cleaning_fee >= 0 AND
    service_fee >= 0 AND taxes >= 0 AND total_price >= 0
  ),
  CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'cancelled', 'completed'))
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guests_count json NOT NULL DEFAULT '{"adults":1,"children":0,"infants":0}'::json;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price_per_night integer NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE bookings ALTER COLUMN check_in TYPE date USING check_in::date;
ALTER TABLE bookings ALTER COLUMN check_out TYPE date USING check_out::date;

INSERT INTO users (uid, email, name, role, password_hash)
SELECT DISTINCT guest_id, 'legacy+' || md5(guest_id) || '@wonderstay.invalid',
       'Legacy Guest', 'guest', '!'
FROM bookings
WHERE guest_id IS NOT NULL
ON CONFLICT (uid) DO NOTHING;

UPDATE bookings AS b
SET price_per_night = COALESCE(
  NULLIF(b.price_per_night, 0),
  (SELECT l.price FROM listings l WHERE l.id = b.listing_id),
  0
);

CREATE TABLE IF NOT EXISTS reviews (
  id text PRIMARY KEY,
  listing_id text NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  author_location text NOT NULL DEFAULT '',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  date text NOT NULL,
  stay_date text NOT NULL,
  comment text NOT NULL,
  ratings_breakdown json,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5)
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_location text NOT NULL DEFAULT '';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS stay_date text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ratings_breakdown json;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

INSERT INTO users (uid, email, name, role, password_hash)
SELECT 'legacy-review-' || id, 'legacy-review+' || md5(id) || '@wonderstay.invalid',
       'Legacy Reviewer', 'guest', '!'
FROM reviews
WHERE user_id IS NULL
ON CONFLICT (uid) DO NOTHING;

UPDATE reviews
SET user_id = 'legacy-review-' || id
WHERE user_id IS NULL;
UPDATE reviews SET stay_date = date WHERE stay_date IS NULL;
ALTER TABLE reviews ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN stay_date SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_listing_user_unique ON reviews (listing_id, user_id);

CREATE TABLE IF NOT EXISTS wishlists (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  listing_id text NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO users (uid, email, name, role, password_hash)
SELECT DISTINCT user_id, 'legacy+' || md5(user_id) || '@wonderstay.invalid', 'Legacy User', 'guest', '!'
FROM wishlists
WHERE user_id IS NOT NULL
ON CONFLICT (uid) DO NOTHING;
CREATE UNIQUE INDEX IF NOT EXISTS wishlists_user_listing_unique ON wishlists (user_id, listing_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_host_id_users_uid_fk') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_host_id_users_uid_fk
      FOREIGN KEY (host_id) REFERENCES users(uid) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_listing_id_listings_id_fk') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_listing_id_listings_id_fk
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_guest_id_users_uid_fk') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_guest_id_users_uid_fk
      FOREIGN KEY (guest_id) REFERENCES users(uid) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_listing_id_listings_id_fk') THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_listing_id_listings_id_fk
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_id_users_uid_fk') THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_users_uid_fk
      FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_user_id_users_uid_fk') THEN
    ALTER TABLE wishlists ADD CONSTRAINT wishlists_user_id_users_uid_fk
      FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_listing_id_listings_id_fk') THEN
    ALTER TABLE wishlists ADD CONSTRAINT wishlists_listing_id_listings_id_fk
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('guest', 'host'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_price_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_price_check CHECK (price > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_cleaning_fee_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_cleaning_fee_check CHECK (cleaning_fee >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_service_fee_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_service_fee_check CHECK (service_fee_percent BETWEEN 0 AND 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_max_guests_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_max_guests_check CHECK (max_guests > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_bedrooms_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_bedrooms_check CHECK (bedrooms >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_beds_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_beds_check CHECK (beds > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_bathrooms_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_bathrooms_check CHECK (bathrooms > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_rating_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_rating_check CHECK (rating BETWEEN 0 AND 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_review_count_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_review_count_check CHECK (review_count >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_coordinates_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_coordinates_check
      CHECK (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_date_range_check') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_date_range_check CHECK (check_in < check_out);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_nights_check') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_nights_check CHECK (nights > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_money_check') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_money_check CHECK (
      price_per_night >= 0 AND subtotal >= 0 AND cleaning_fee >= 0 AND
      service_fee >= 0 AND taxes >= 0 AND total_price >= 0
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_status_check') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'cancelled', 'completed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_check') THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bookings_listing_dates_idx ON bookings (listing_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS bookings_guest_id_idx ON bookings (guest_id);
CREATE INDEX IF NOT EXISTS reviews_listing_id_idx ON reviews (listing_id);
