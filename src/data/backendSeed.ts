import { Listing, Review, Booking, User } from '../types/index.ts';

export const CURRENT_USER: User = {
  id: 'user_aarav',
  name: 'Aarav Mehta',
  email: 'aarav.mehta@wonderstay.in',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  role: 'guest',
  isSuperhost: true,
  joinedDate: 'Joined January 2022',
  bio: 'Architectural photographer and traveler exploring India’s heritage estates.',
  responseRate: '100%'
};

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'stay-goa-1',
    title: 'Villa Terra Rosa · 300-Yr Portuguese Estate & Private Pool',
    tagline: 'Restored colonial villa surrounded by coconut groves and frangipani',
    description: 'A serene coastal escape with a private pool and heritage architecture.',
    category: 'Beachfront',
    propertyType: 'Entire heritage villa',
    roomType: 'Entire place',
    location: {
      address: 'Badem Road, Near St. Anthony Church',
      city: 'Assagao, Goa',
      state: 'Goa',
      country: 'India',
      lat: 15.5898,
      lng: 73.7744,
      neighborhood: 'North Goa Heritage Belt'
    },
    price: 18500,
    cleaningFee: 2000,
    serviceFeePercent: 0.12,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    amenities: ['wifi', 'pool', 'kitchen', 'air_conditioning', 'free_parking', 'patio', 'workspace'],
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80'],
    host: {
      id: 'host_rodrigues',
      name: 'Maria & Neil Fernandes',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2019'
    },
    rating: 4.97,
    reviewCount: 54,
    ratingsBreakdown: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 4.8
    },
    houseRules: ['Check-in after 2:00 PM', 'Quiet hours after 10:30 PM'],
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    isFeatured: true,
    createdAt: '2023-04-12'
  },
  {
    id: 'stay-manali-2',
    title: 'The Deodar Chalet · Cedar A-Frame & Himalayan Panorama',
    tagline: 'Alpine wood retreat facing the snow-crowned Rohtang range',
    description: 'A quiet mountain retreat with warm cedar interiors and mountain views.',
    category: 'Cabins',
    propertyType: 'Entire alpine chalet',
    roomType: 'Entire place',
    location: {
      address: 'Club House Road, Old Manali',
      city: 'Manali, Himachal Pradesh',
      state: 'Himachal Pradesh',
      country: 'India',
      lat: 32.253,
      lng: 77.1764,
      neighborhood: 'Apple Orchard Valley'
    },
    price: 12800,
    cleaningFee: 1500,
    serviceFeePercent: 0.12,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ['wifi', 'fireplace', 'kitchen', 'free_parking', 'workspace'],
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80'],
    host: {
      id: 'host_vikram',
      name: 'Vikram Thakur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2020'
    },
    rating: 4.96,
    reviewCount: 42,
    ratingsBreakdown: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 4.9,
      checkIn: 5,
      value: 4.9
    },
    houseRules: ['Check-in after 1:00 PM', 'No shoes inside'],
    cancellationPolicy: 'Full refund for cancellations made 5 days before arrival.',
    isFeatured: true,
    createdAt: '2023-06-18'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'WL-100001',
    listingId: 'stay-goa-1',
    listingTitle: 'Villa Terra Rosa',
    listingImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    listingCity: 'Assagao, Goa',
    listingCountry: 'India',
    userId: 'user_aarav',
    guestName: 'Aarav Mehta',
    guestEmail: 'aarav.mehta@wonderstay.in',
    checkIn: '2026-11-01',
    checkOut: '2026-11-05',
    nights: 4,
    guestsCount: { adults: 2, children: 0, infants: 0 },
    pricePerNight: 18500,
    subtotal: 74000,
    cleaningFee: 2000,
    serviceFee: 8880,
    taxes: 5920,
    totalPrice: 90800,
    status: 'confirmed',
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    listingId: 'stay-goa-1',
    userId: 'user_aarav',
    authorName: 'Aarav Mehta',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Mumbai',
    rating: 5,
    date: 'September 2026',
    stayDate: 'September 2026',
    comment: 'Beautiful heritage property with warm hospitality and a lovely pool.',
    ratingsBreakdown: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5
    }
  }
];
