import { Listing, Review, Booking, User } from '../types/index.ts';

import goaVillaImg from '../assets/images/stay_goa_heritage_villa_1790968187563_optimized.jpg';
import manaliChaletImg from '../assets/images/stay_manali_alpine_cabin_1790968203044_optimized.jpg';
import udaipurHaveliImg from '../assets/images/stay_udaipur_lake_palace_1790968214660_optimized.jpg';
import munnarTreehouseImg from '../assets/images/stay_munnar_treehouse_1790968226353_optimized.jpg';
import jaipurHaveliImg from '../assets/images/stay_jaipur_haveli_suite_1790968238430_optimized.jpg';

export const CURRENT_USER: User = {
  id: 'user_aarav',
  name: 'Aarav Mehta',
  email: 'aarav.mehta@wonderstay.in',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  role: 'guest',
  isSuperhost: true,
  joinedDate: 'Joined January 2022',
  bio: 'Architectural photographer and traveler exploring India’s heritage estates, hill retreats, and coastal havens.',
  responseRate: '100%'
};

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'stay-goa-1',
    title: 'Villa Terra Rosa · 300-Yr Portuguese Estate & Private Pool',
    tagline: 'Restored colonial villa surrounded by coconut groves and frangipani',
    description: 'Tucked away in the serene coastal village of Assagao, Villa Terra Rosa is a meticulously restored 300-year-old Portuguese-Goan mansion. Features handcrafted mother-of-pearl window inlays, high timber rafters, an open-air veranda, and a private azure plunge pool framed by swaying palms.',
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
    amenities: [
      'wifi',
      'pool',
      'kitchen',
      'air_conditioning',
      'free_parking',
      'patio',
      'workspace',
      'coffee_maker'
    ],
    images: [
      goaVillaImg,
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
    ],
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
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 4.9,
      location: 5.0,
      checkIn: 5.0,
      value: 4.8
    },
    houseRules: [
      'Check-in: 2:00 PM - 9:00 PM',
      'Check-out: 11:00 AM',
      'Eco-friendly property: please switch off ACs when outside',
      'Quiet hours after 10:30 PM'
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    isFeatured: true,
    createdAt: '2023-04-12'
  },
  {
    id: 'stay-manali-2',
    title: 'The Deodar Chalet · Cedar A-Frame & Himalayan Panorama',
    tagline: 'Alpine wood retreat facing the snow-crowned Rohtang range',
    description: 'Perched high in Old Manali among ancient deodar cedar forests, The Deodar Chalet is an architectural sanctuary. Floor-to-ceiling double-glazed windows look out onto snowcapped Himalayan summits. Enjoy a cast-iron Swedish wood fireplace, radiant heating, and hot apple cider on the deck.',
    category: 'Cabins',
    propertyType: 'Entire alpine chalet',
    roomType: 'Entire place',
    location: {
      address: 'Club House Road, Old Manali',
      city: 'Manali, Himachal Pradesh',
      state: 'Himachal Pradesh',
      country: 'India',
      lat: 32.2530,
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
    amenities: [
      'wifi',
      'fireplace',
      'kitchen',
      'free_parking',
      'mountain_view',
      'patio',
      'workspace',
      'coffee_maker'
    ],
    images: [
      manaliChaletImg,
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1200&auto=format&fit=crop&q=80'
    ],
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
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 5.0,
      location: 4.9,
      checkIn: 5.0,
      value: 4.9
    },
    houseRules: [
      'Check-in: 1:00 PM',
      'Check-out: 11:00 AM',
      'Snow boots to be left in heated boot room',
      'Bonfire on lawn upon host notice'
    ],
    cancellationPolicy: 'Full refund for cancellations made 5 days before arrival.',
    isFeatured: true,
    createdAt: '2023-06-18'
  },
  {
    id: 'stay-udaipur-3',
    title: 'Haveli Lake Pichola · Jharokha Balconies & Water Palace View',
    tagline: 'Heritage haveli with private marble terrace right over the lake',
    description: 'Experience regal Mewari hospitality. Overlooking the shimmering waters of Lake Pichola and the illuminated City Palace, this 18th-century noble haveli features authentic hand-cut jharokhas, marble courtyards with fountains, antique brass furnishings, and romantic sunset boat pick-up.',
    category: 'Lakefront',
    propertyType: 'Heritage haveli suite',
    roomType: 'Entire place',
    location: {
      address: 'Near Lal Ghat, Old City',
      city: 'Udaipur, Rajasthan',
      state: 'Rajasthan',
      country: 'India',
      lat: 24.5764,
      lng: 73.6835,
      neighborhood: 'Pichola Waterfront'
    },
    price: 24500,
    cleaningFee: 2200,
    serviceFeePercent: 0.12,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: [
      'wifi',
      'air_conditioning',
      'kitchen',
      'patio',
      'workspace',
      'coffee_maker',
      'hot_tub'
    ],
    images: [
      udaipurHaveliImg,
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80'
    ],
    host: {
      id: 'host_ranveer',
      name: 'Kunwar Ranveer Singh',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2017'
    },
    rating: 4.99,
    reviewCount: 68,
    ratingsBreakdown: {
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 5.0,
      location: 5.0,
      checkIn: 5.0,
      value: 4.9
    },
    houseRules: [
      'Check-in: 2:00 PM',
      'Check-out: 11:00 AM',
      'Shoes off in inner temple sanctum',
      'Respectful noise levels in heritage residential lane'
    ],
    cancellationPolicy: 'Moderate cancellation: Full refund up to 5 days before arrival.',
    isFeatured: true,
    createdAt: '2023-01-10'
  },
  {
    id: 'stay-munnar-4',
    title: 'The Canopy Treehouse · Rolling Tea Estates & Valley Mist',
    tagline: 'Perched 40 feet high above emerald green cardamom and tea slopes',
    description: 'Immerse in the misty Western Ghats biodiversity. Constructed from sustainably treated local teak and bamboo, this elevated treehouse suite overlooks unbroken green valleys of high-grown orthodox tea. Wake up to birdsong, sip single-estate freshly plucked tea, and trek through private estate trails.',
    category: 'Treehouses',
    propertyType: 'Entire treehouse',
    roomType: 'Entire place',
    location: {
      address: 'Pothamedu Viewpoint Estate',
      city: 'Munnar, Kerala',
      state: 'Kerala',
      country: 'India',
      lat: 10.0520,
      lng: 77.0601,
      neighborhood: 'Anamudi Tea Valleys'
    },
    price: 14200,
    cleaningFee: 1200,
    serviceFeePercent: 0.12,
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    amenities: [
      'wifi',
      'free_parking',
      'mountain_view',
      'patio',
      'workspace',
      'coffee_maker'
    ],
    images: [
      munnarTreehouseImg,
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80'
    ],
    host: {
      id: 'host_mathew',
      name: 'Mathew & Anjali Kurian',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2018'
    },
    rating: 4.98,
    reviewCount: 82,
    ratingsBreakdown: {
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 5.0,
      location: 5.0,
      checkIn: 5.0,
      value: 4.9
    },
    houseRules: [
      'Check-in: 1:00 PM',
      'Check-out: 11:00 AM',
      'Strictly non-smoking amidst natural tea foliage',
      'Eco-sensitive reserve zone'
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    isFeatured: true,
    createdAt: '2022-11-20'
  },
  {
    id: 'stay-jaipur-5',
    title: 'The Amber Courtyard Haveli · Sandstone Arches & Jharokhas',
    tagline: 'Royal heritage estate in the heart of the Pink City',
    description: 'Step into the grandeur of Rajasthan royalty. Hand-carved pink Dholpur sandstone pillars, painted floral frescoes, a tranquil courtyard marble fountain, and an opulent rooftop terrace with sunset views of the Nahargarh Fort ramparts.',
    category: 'Heritage Havelis',
    propertyType: 'Entire royal haveli',
    roomType: 'Entire place',
    location: {
      address: 'Jacob Road, Civil Lines',
      city: 'Jaipur, Rajasthan',
      state: 'Rajasthan',
      country: 'India',
      lat: 26.9062,
      lng: 75.7895,
      neighborhood: 'Civil Lines Enclave'
    },
    price: 16900,
    cleaningFee: 1800,
    serviceFeePercent: 0.12,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    amenities: [
      'wifi',
      'air_conditioning',
      'kitchen',
      'free_parking',
      'patio',
      'workspace',
      'coffee_maker'
    ],
    images: [
      jaipurHaveliImg,
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
    ],
    host: {
      id: 'host_gayatri',
      name: 'Princess Gayatri & Raghav',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '99%',
      responseTime: 'within an hour',
      joinedYear: '2016'
    },
    rating: 4.95,
    reviewCount: 47,
    ratingsBreakdown: {
      cleanliness: 4.9,
      accuracy: 5.0,
      communication: 5.0,
      location: 5.0,
      checkIn: 4.9,
      value: 4.8
    },
    houseRules: [
      'Check-in: 2:00 PM',
      'Check-out: 11:00 AM',
      'No loud music in courtyard after 10 PM',
      'Pets allowed on request'
    ],
    cancellationPolicy: 'Moderate cancellation: Full refund up to 5 days before check-in.',
    isFeatured: true,
    createdAt: '2023-02-14'
  },
  {
    id: 'stay-rishikesh-6',
    title: 'Ganga Nirvana Retreat · Riverside Yoga Deck & Foothills',
    tagline: 'Private sanctuary overlooking the turquoise Ganga and green Himalayas',
    description: 'Situated above the sacred river bend in Tapovan, Rishikesh. Features a teak yoga shala, stone outdoor tub, glass-fronted bedrooms gazing onto the holy Ganges, and private trail down to peaceful white-sand river beaches.',
    category: 'Countryside',
    propertyType: 'Entire riverside villa',
    roomType: 'Entire place',
    location: {
      address: 'Badrinath Road, Tapovan',
      city: 'Rishikesh, Uttarakhand',
      state: 'Uttarakhand',
      country: 'India',
      lat: 30.1345,
      lng: 78.3275,
      neighborhood: 'Tapovan Heights'
    },
    price: 11500,
    cleaningFee: 1200,
    serviceFeePercent: 0.12,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: [
      'wifi',
      'kitchen',
      'air_conditioning',
      'workspace',
      'patio',
      'free_parking',
      'coffee_maker'
    ],
    images: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80'
    ],
    host: {
      id: 'host_devraj',
      name: 'Acharya Devraj & Shreya',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2019'
    },
    rating: 4.96,
    reviewCount: 38,
    ratingsBreakdown: {
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 5.0,
      location: 5.0,
      checkIn: 5.0,
      value: 4.8
    },
    houseRules: [
      'Check-in: 2:00 PM',
      'Check-out: 11:00 AM',
      'Pure vegetarian culinary space',
      'Quiet reflective environment'
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    createdAt: '2023-05-10'
  },
  {
    id: 'stay-ladakh-7',
    title: 'Stok Starlight Stone Lodge · High-Altitude Himalayan Escarpment',
    tagline: 'Solar-heated stone eco-lodge with unmatched Milky Way views',
    description: 'Immerse in the otherworldly lunar desert of Ladakh. Built with local granite, mud-plaster, and Ladakhi poplar wood, this sustainable lodge features passive solar trombe walls, celestial stargazing telescopes, and unobstructed views of the snow-clad Stok Kangri massif.',
    category: 'Skiing',
    propertyType: 'Entire stone eco-lodge',
    roomType: 'Entire place',
    location: {
      address: 'Stok Village Road, Stok',
      city: 'Leh, Ladakh',
      state: 'Ladakh',
      country: 'India',
      lat: 34.0543,
      lng: 77.5458,
      neighborhood: 'Stok Palace Valley'
    },
    price: 15500,
    cleaningFee: 1500,
    serviceFeePercent: 0.12,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: [
      'wifi',
      'fireplace',
      'kitchen',
      'mountain_view',
      'free_parking',
      'workspace',
      'patio'
    ],
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80'
    ],
    host: {
      id: 'host_dorje',
      name: 'Tenzing Dorje',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2018'
    },
    rating: 4.98,
    reviewCount: 45,
    ratingsBreakdown: {
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 5.0,
      location: 5.0,
      checkIn: 5.0,
      value: 4.9
    },
    houseRules: [
      'Check-in: 1:00 PM',
      'Check-out: 10:00 AM',
      'Acclimatization day strongly recommended on arrival',
      'Zero plastic policy'
    ],
    cancellationPolicy: 'Moderate cancellation: Full refund up to 5 days before check-in.',
    createdAt: '2023-03-22'
  },
  {
    id: 'stay-coorg-8',
    title: 'The Coffee Plantation Estate · Arabica Groves & Infinity Deck',
    tagline: 'Colonial planter bungalow set within 50 acres of shade-grown coffee',
    description: 'Immerse in the intoxicating fragrance of coffee blossoms and pepper vines in Madikeri, Coorg. High rosewood ceilings, brass beds, an outdoor bonfire amphitheater, fresh estate-roasted French press coffee, and guided morning wildlife treks through the Western Ghats.',
    category: 'Tropical',
    propertyType: 'Entire colonial estate',
    roomType: 'Entire place',
    location: {
      address: 'Siddapur Road, Madikeri',
      city: 'Coorg, Karnataka',
      state: 'Karnataka',
      country: 'India',
      lat: 12.3860,
      lng: 75.7925,
      neighborhood: 'Madikeri Rainforest Hills'
    },
    price: 13500,
    cleaningFee: 1400,
    serviceFeePercent: 0.12,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    amenities: [
      'wifi',
      'fireplace',
      'kitchen',
      'free_parking',
      'patio',
      'workspace',
      'bbq_grill'
    ],
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80'
    ],
    host: {
      id: 'host_bopanna',
      name: 'Kushal & Muthamma Bopanna',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      superhost: true,
      responseRate: '100%',
      responseTime: 'within an hour',
      joinedYear: '2017'
    },
    rating: 4.97,
    reviewCount: 51,
    ratingsBreakdown: {
      cleanliness: 5.0,
      accuracy: 5.0,
      communication: 5.0,
      location: 5.0,
      checkIn: 5.0,
      value: 4.9
    },
    houseRules: [
      'Check-in: 2:00 PM',
      'Check-out: 11:00 AM',
      'Plantation walks permitted only with estate guide',
      'Quiet hours after 10 PM'
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    createdAt: '2023-04-05'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    listingId: 'stay-goa-1',
    userId: 'user_rohit',
    authorName: 'Rohit Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Mumbai, Maharashtra',
    rating: 5,
    date: 'September 2026',
    stayDate: 'Stayed 4 nights',
    comment: 'Villa Terra Rosa is pure architectural bliss. The heritage Goan rafters, serene pool surrounded by frangipani trees, and the calm village of Assagao made this our best Goa trip ever. Neil was an exceptional host.',
    ratingsBreakdown: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5
    }
  },
  {
    id: 'rev-2',
    listingId: 'stay-manali-2',
    userId: 'user_ananya',
    authorName: 'Ananya Iyer',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Bengaluru, Karnataka',
    rating: 5,
    date: 'August 2026',
    stayDate: 'Stayed 3 nights',
    comment: 'Waking up to the towering deodars and crisp Himalayan chill was transformative. The wood fireplace kept the chalet so warm and cozy. Vikram even arranged fresh Kullu apples for us.',
    ratingsBreakdown: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5
    }
  },
  {
    id: 'rev-3',
    listingId: 'stay-udaipur-3',
    userId: 'user_priya',
    authorName: 'Priya & Kabir Sengupta',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'New Delhi, NCR',
    rating: 5,
    date: 'September 2026',
    stayDate: 'Stayed 4 nights',
    comment: 'Sitting in the carved jharokha balcony with Lake Pichola shimmering right beneath us was like living in a fairytale. The sunset views of City Palace are unmatched by any 5-star hotel in Udaipur.',
    ratingsBreakdown: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5
    }
  },
  {
    id: 'rev-4',
    listingId: 'stay-munnar-4',
    userId: 'user_karthik',
    authorName: 'Karthik Raman',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Chennai, Tamil Nadu',
    rating: 5,
    date: 'July 2026',
    stayDate: 'Stayed 5 nights',
    comment: 'High above the clouds in the Munnar tea estates! The sound of birds in the morning mist and drinking freshly brewed single-estate tea was unforgettable. A true architectural gem in God’s Own Country.',
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

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'WS-849102',
    listingId: 'stay-goa-1',
    listingTitle: 'Villa Terra Rosa · 300-Yr Portuguese Estate & Private Pool',
    listingImage: goaVillaImg,
    listingCity: 'Assagao, Goa',
    listingCountry: 'India',
    userId: 'user_aarav',
    guestName: 'Aarav Mehta',
    guestEmail: 'aarav.mehta@wonderstay.in',
    checkIn: '2026-10-18',
    checkOut: '2026-10-22',
    nights: 4,
    guestsCount: { adults: 2, children: 0, infants: 0 },
    pricePerNight: 18500,
    subtotal: 74000,
    cleaningFee: 2000,
    serviceFee: 8880,
    taxes: 5920,
    totalPrice: 90800,
    status: 'confirmed',
    paymentLast4: '7104',
    createdAt: '2026-09-20'
  },
  {
    id: 'WS-621840',
    listingId: 'stay-manali-2',
    listingTitle: 'The Deodar Chalet · Cedar A-Frame & Himalayan Panorama',
    listingImage: manaliChaletImg,
    listingCity: 'Manali, Himachal Pradesh',
    listingCountry: 'India',
    userId: 'user_aarav',
    guestName: 'Aarav Mehta',
    guestEmail: 'aarav.mehta@wonderstay.in',
    checkIn: '2026-11-10',
    checkOut: '2026-11-14',
    nights: 4,
    guestsCount: { adults: 2, children: 0, infants: 0 },
    pricePerNight: 12800,
    subtotal: 51200,
    cleaningFee: 1500,
    serviceFee: 6144,
    taxes: 4096,
    totalPrice: 62940,
    status: 'confirmed',
    paymentLast4: '3829',
    createdAt: '2026-09-26'
  }
];
