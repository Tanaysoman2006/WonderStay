export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'guest' | 'host';
  isSuperhost?: boolean;
  joinedDate: string;
  bio?: string;
  responseRate?: string;
}

export type ListingCategory =
  | 'Beachfront'
  | 'Cabins'
  | 'Iconic Cities'
  | 'Mansions'
  | 'Treehouses'
  | 'Countryside'
  | 'Lakefront'
  | 'Heritage Havelis'
  | 'Tropical'
  | 'Tiny Homes'
  | 'Skiing'
  | 'Desert';

export interface LocationData {
  address: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  neighborhood?: string;
}

export interface RatingsBreakdown {
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  checkIn: number;
  value: number;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorLocation?: string;
  rating: number;
  date: string;
  stayDate: string;
  comment: string;
  ratingsBreakdown?: RatingsBreakdown;
}

export interface Listing {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: ListingCategory;
  propertyType: string;
  roomType: 'Entire place' | 'Private room' | 'Shared room';
  location: LocationData;
  price: number; // USD per night
  cleaningFee: number;
  serviceFeePercent: number; // e.g. 0.12 (12%)
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    superhost: boolean;
    responseRate: string;
    responseTime: string;
    joinedYear: string;
  };
  rating: number;
  reviewCount: number;
  ratingsBreakdown: RatingsBreakdown;
  houseRules: string[];
  cancellationPolicy: string;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Booking {
  id: string; // e.g. "WL-849201"
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingCity: string;
  listingCountry: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guestsCount: {
    adults: number;
    children: number;
    infants: number;
  };
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentLast4?: string;
  createdAt: string;
}

export interface FilterState {
  category: string;
  destination: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  priceRange: [number, number];
  propertyType: string | null;
  bedrooms: number | null;
  amenities: string[];
  displayTotalBeforeTaxes: boolean;
}
