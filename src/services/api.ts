import { Listing, Booking, Review, User, FilterState } from '../types/index.ts';
import { INITIAL_LISTINGS, INITIAL_BOOKINGS, INITIAL_REVIEWS, CURRENT_USER } from '../data/seedListings.ts';
import { getStoredToken, removeToken, storeToken } from '../utils/jwt.ts';

const STORAGE_KEYS = {
  LISTINGS: 'wonderstay_listings_v2',
  BOOKINGS: 'wonderstay_bookings_v2',
  REVIEWS: 'wonderstay_reviews_v2',
  USER: 'wonderstay_user_v2',
  WISHLIST: 'wonderstay_wishlist_v2'
};

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string | undefined) || '/api';

class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `Request failed with status ${response.status}`;
    try {
      const body = JSON.parse(errorText) as { error?: unknown };
      if (typeof body.error === 'string') message = body.error;
    } catch {
      // Keep the raw response body when the server does not return JSON.
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// Helper for local storage persistence
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from storage`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
  }
}

// In-memory repositories initialized from localStorage / seed
let listingsCache: Listing[] = loadFromStorage(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
let bookingsCache: Booking[] = loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
let reviewsCache: Review[] = loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
let userCache: User = loadFromStorage(STORAGE_KEYS.USER, CURRENT_USER);
let wishlistCache: string[] = loadFromStorage(STORAGE_KEYS.WISHLIST, ['stay-goa-1', 'stay-udaipur-3']);

export const api = {
  async searchListings(filters?: Partial<FilterState>): Promise<Listing[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters?.destination?.trim()) params.set('search', filters.destination.trim());
    if (filters?.priceRange) {
      params.set('minPrice', String(filters.priceRange[0]));
      params.set('maxPrice', String(filters.priceRange[1]));
    }
    if (filters?.guests) {
      const guests = filters.guests.adults + filters.guests.children;
      if (guests > 0) params.set('guests', String(guests));
    }
    if (filters?.propertyType && filters.propertyType !== 'Any') params.set('propertyType', filters.propertyType);
    if (filters?.bedrooms) params.set('bedrooms', String(filters.bedrooms));
    if (filters?.amenities?.length) params.set('amenities', filters.amenities.join(','));
    if (filters?.checkIn && filters.checkOut) {
      params.set('checkIn', filters.checkIn);
      params.set('checkOut', filters.checkOut);
    }
    const query = params.size ? `?${params.toString()}` : '';
    return fetchJson<Listing[]>(`/listings${query}`);
  },

  async refreshDataFromApi(): Promise<void> {
    const [listingsFromApi, reviewsFromApi] = await Promise.all([
      this.searchListings(),
      fetchJson<Review[]>('/reviews')
    ]);
    listingsCache = listingsFromApi;
    saveToStorage(STORAGE_KEYS.LISTINGS, listingsCache);
    reviewsCache = reviewsFromApi;
    saveToStorage(STORAGE_KEYS.REVIEWS, reviewsCache);

    if (getStoredToken()) {
      bookingsCache = await fetchJson<Booking[]>('/bookings');
      saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    } else {
      bookingsCache = [];
      saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    }
  },

  // Current user & authentication with JWT
  getCurrentUser(): User {
    return userCache;
  },

  getAuthToken(): string | null {
    return getStoredToken();
  },

  async restoreSession(): Promise<User | null> {
    if (!getStoredToken()) return null;
    try {
      const result = await fetchJson<{ user: Pick<User, 'id' | 'name' | 'email' | 'role'> & Partial<User> }>('/auth/me');
      userCache = { ...CURRENT_USER, ...result.user, avatar: result.user.avatar || '' };
      saveToStorage(STORAGE_KEYS.USER, userCache);
      return userCache;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.logout();
        return null;
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<User> {
    const result = await fetchJson<{ token: string; user: Pick<User, 'id' | 'name' | 'email' | 'role'> & Partial<User> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    storeToken(result.token);
    userCache = { ...CURRENT_USER, ...result.user, avatar: result.user.avatar || '' };
    saveToStorage(STORAGE_KEYS.USER, userCache);
    return userCache;
  },

  async register(name: string, email: string, password: string, role: 'guest' | 'host' = 'guest'): Promise<User> {
    const result = await fetchJson<{ token: string; user: Pick<User, 'id' | 'name' | 'email' | 'role'> & Partial<User> }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    storeToken(result.token);
    userCache = { ...CURRENT_USER, ...result.user, avatar: result.user.avatar || '' };
    saveToStorage(STORAGE_KEYS.USER, userCache);
    return userCache;
  },

  logout(): void {
    removeToken();
    userCache = { ...CURRENT_USER };
    bookingsCache = [];
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
  },

  updateCurrentUser(updates: Partial<User>): User {
    userCache = { ...userCache, ...updates };
    saveToStorage(STORAGE_KEYS.USER, userCache);
    return userCache;
  },

  toggleUserRole(): User {
    const newRole = userCache.role === 'guest' ? 'host' : 'guest';
    return this.updateCurrentUser({ role: newRole });
  },

  // Listings CRUD
  getListings(): Listing[] {
    return [...listingsCache];
  },

  getListingById(id: string): Listing | undefined {
    return listingsCache.find(item => item.id === id);
  },

  async getListingAvailability(listingId: string, checkIn: string, checkOut: string): Promise<{ available: boolean; conflict?: { checkIn: string; checkOut: string } }> {
    const params = new URLSearchParams({ checkIn, checkOut });
    return fetchJson(`/listings/${encodeURIComponent(listingId)}/availability?${params.toString()}`);
  },

  async createListing(newListingData: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'ratingsBreakdown'>): Promise<Listing> {
    const created = await fetchJson<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify(newListingData)
    });
    listingsCache = [created, ...listingsCache];
    saveToStorage(STORAGE_KEYS.LISTINGS, listingsCache);
    return created;
  },

  async deleteListing(id: string): Promise<void> {
    await fetchJson<void>(`/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    listingsCache = listingsCache.filter(item => item.id !== id);
    saveToStorage(STORAGE_KEYS.LISTINGS, listingsCache);
  },

  async createBooking(bookingPayload: Pick<Booking, 'listingId' | 'checkIn' | 'checkOut' | 'guestsCount'>): Promise<Booking> {
    const created = await fetchJson<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload)
    });
    bookingsCache = [created, ...bookingsCache.filter(booking => booking.id !== created.id)];
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    return created;
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    const updated = await fetchJson<Booking>(`/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' })
    });
    bookingsCache = bookingsCache.map(booking => booking.id === updated.id ? updated : booking);
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    return updated;
  },

  async getReviewEligibility(listingId: string): Promise<{ eligible: boolean; stayDate?: string; alreadyReviewed: boolean }> {
    return fetchJson(`/reviews/eligibility/${encodeURIComponent(listingId)}`);
  },

  getUserBookings(userId: string): Booking[] {
    return bookingsCache.filter(b => b.userId === userId);
  },

  getHostBookings(): Booking[] {
    const hostListingIds = new Set(
      listingsCache
        .filter(l => l.host.id === userCache.id)
        .map(l => l.id)
    );
    return bookingsCache.filter(b => hostListingIds.has(b.listingId));
  },

  // Review Aggregation (Module 4 requirement)
  getReviewsForListing(listingId: string): Review[] {
    return reviewsCache.filter(r => r.listingId === listingId);
  },

  async createReview(reviewPayload: Pick<Review, 'listingId' | 'stayDate' | 'rating' | 'comment' | 'authorLocation' | 'ratingsBreakdown'>): Promise<Review> {
    const newReview = await fetchJson<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewPayload)
    });
    reviewsCache = [newReview, ...reviewsCache.filter(review => review.id !== newReview.id)];
    saveToStorage(STORAGE_KEYS.REVIEWS, reviewsCache);

    return newReview;
  },

  // Wishlist
  getWishlist(): string[] {
    return wishlistCache;
  },

  toggleWishlist(listingId: string): boolean {
    const exists = wishlistCache.includes(listingId);
    if (exists) {
      wishlistCache = wishlistCache.filter(id => id !== listingId);
    } else {
      wishlistCache = [...wishlistCache, listingId];
    }
    saveToStorage(STORAGE_KEYS.WISHLIST, wishlistCache);
    return !exists;
  },

  resetAllData(): void {
    listingsCache = [...INITIAL_LISTINGS];
    bookingsCache = [...INITIAL_BOOKINGS];
    reviewsCache = [...INITIAL_REVIEWS];
    wishlistCache = ['stay-goa-1', 'stay-udaipur-3'];
    saveToStorage(STORAGE_KEYS.LISTINGS, listingsCache);
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsCache);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviewsCache);
    saveToStorage(STORAGE_KEYS.WISHLIST, wishlistCache);
  }
};
