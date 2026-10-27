import React, { useState } from 'react';
import {
  DollarSign,
  Home,
  CalendarCheck,
  Star,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  X,
  Sparkles,
  ArrowLeft,
  Building,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { Listing, Booking, User, ListingCategory } from '../types/index.ts';
import { formatINR } from '../utils/formatCurrency.ts';

import goaVillaImg from '../assets/images/stay_goa_heritage_villa_1790968187563_optimized.jpg';
import manaliChaletImg from '../assets/images/stay_manali_alpine_cabin_1790968203044_optimized.jpg';
import udaipurHaveliImg from '../assets/images/stay_udaipur_lake_palace_1790968214660_optimized.jpg';
import munnarTreehouseImg from '../assets/images/stay_munnar_treehouse_1790968226353_optimized.jpg';
import jaipurHaveliImg from '../assets/images/stay_jaipur_haveli_suite_1790968238430_optimized.jpg';

interface HostDashboardProps {
  currentUser: User;
  allListings: Listing[];
  allBookings: Booking[];
  onCreateListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'ratingsBreakdown'>) => Promise<void>;
  onDeleteListing: (id: string) => Promise<void>;
  onSelectListing: (listing: Listing) => void;
  onBackToExplore: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentUser,
  allListings,
  allBookings,
  onCreateListing,
  onDeleteListing,
  onSelectListing,
  onBackToExplore
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'reservations' | 'create'>('listings');

  // New listing form state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Beachfront');
  const [propertyType, setPropertyType] = useState('Entire heritage villa');
  const [address, setAddress] = useState('Anjuna Beach Road');
  const [city, setCity] = useState('Goa');
  const [country, setCountry] = useState('India');
  const [lat, setLat] = useState('15.5898');
  const [lng, setLng] = useState('73.7744');
  const [price, setPrice] = useState('16500');
  const [cleaningFee, setCleaningFee] = useState('1800');
  const [maxGuests, setMaxGuests] = useState('4');
  const [bedrooms, setBedrooms] = useState('2');
  const [beds, setBeds] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [selectedImage, setSelectedImage] = useState(goaVillaImg);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'wifi',
    'pool',
    'kitchen',
    'air_conditioning'
  ]);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState('');

  // Compute host stats
  const displayedListings = allListings.filter(l => l.host.id === currentUser.id);

  const displayedListingIds = new Set(displayedListings.map(l => l.id));
  const hostBookings = allBookings.filter(b => displayedListingIds.has(b.listingId));

  const totalRevenue = hostBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.subtotal + b.cleaningFee), 0);

  const averageRating = displayedListings.length > 0
    ? (displayedListings.reduce((sum, l) => sum + l.rating, 0) / displayedListings.length).toFixed(2)
    : '0.00';

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setFormError('');
    const finalImage = customImageUrl.trim() ? customImageUrl.trim() : selectedImage;

    const payload = {
      title,
      tagline,
      description,
      category,
      propertyType,
      roomType: 'Entire place' as const,
      location: {
        address,
        city,
        country,
        lat: parseFloat(lat) || 36.0,
        lng: parseFloat(lng) || 25.0
      },
      price: parseFloat(price) || 250,
      cleaningFee: parseFloat(cleaningFee) || 50,
      serviceFeePercent: 0.12,
      maxGuests: parseInt(maxGuests) || 2,
      bedrooms: parseInt(bedrooms) || 1,
      beds: parseInt(beds) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      amenities: selectedAmenities,
      images: [
        finalImage,
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
      ],
      host: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        superhost: true,
        responseRate: '100%',
        responseTime: 'within an hour',
        joinedYear: '2024'
      },
      houseRules: [
        'Check-in: 3:00 PM',
        'Check-out: 11:00 AM',
        'No smoking',
        'Quiet hours after 10 PM'
      ],
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in.'
    };

    try {
      await onCreateListing(payload);
      setPublishedSuccess(true);
      setTimeout(() => {
        setPublishedSuccess(false);
        setActiveTab('listings');
      }, 1200);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not publish listing.');
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
        <div>
          <button
            onClick={onBackToExplore}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to explore stays</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-neutral-900">Host Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
              Superhost
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your properties, inspect incoming guest reservations, and list new spaces.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatINR(totalRevenue)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Net host payouts received</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Properties</span>
            <Home className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">
            {displayedListings.length}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Published on Wanderlust</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reservations</span>
            <CalendarCheck className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">
            {hostBookings.filter(b => b.status === 'confirmed').length}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Confirmed guest stays</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">
            {averageRating} ★
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Based on guest verified reviews</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl max-w-md mb-8">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'listings'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Your Listings ({displayedListings.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'reservations'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Guest Bookings ({hostBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'create'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          + Create Stay
        </button>
      </div>

      {/* Tab 1: Listings Management */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-16/10 w-full bg-neutral-100">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                  {listing.category}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span>{listing.location.city}, {listing.location.country}</span>
                    <span className="font-semibold text-neutral-900">★ {listing.rating.toFixed(2)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                    {listing.bedrooms} bed · {listing.bathrooms} bath · max {listing.maxGuests} guests
                  </p>
                  <p className="text-sm font-bold text-neutral-900 mt-2 tabular-nums">
                    {formatINR(listing.price)} <span className="text-xs font-normal text-neutral-500">/ night</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
                  <button
                    onClick={() => onSelectListing(listing)}
                    className="text-xs font-semibold text-neutral-800 hover:text-rose-600 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Listing</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove listing "${listing.title}"?`)) {
                        onDeleteListing(listing.id);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Guest Reservations */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          {hostBookings.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm font-semibold text-neutral-800">No bookings received yet</p>
              <p className="text-xs mt-1">When guests book your listings, their dates and payouts will show here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Nights</th>
                    <th className="py-3 px-4">Host Payout</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {hostBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{b.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-800">{b.guestName}</div>
                        <div className="text-[11px] text-neutral-400">{b.guestEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-800 max-w-[180px] truncate">
                        {b.listingTitle}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 font-medium">
                        {b.checkIn} to {b.checkOut}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold">{b.nights}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700 tabular-nums">
                        {formatINR(b.subtotal + b.cleaningFee)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Create New Listing */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-3xl shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900">List Your Space on Wanderlust</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Provide authentic architectural details, transparent pricing, and crisp photos.
            </p>
          </div>

          {publishedSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Listing successfully created and published to Wanderlust!</span>
            </div>
          )}
          {formError && (
            <div role="alert" className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            {/* Title & Tagline */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Glass Pavilion · Forest Immersion & Fireplace"
                  className="w-full p-3 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                  Tagline / Catchphrase *
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Minimalist architectural glass sanctuary amidst alpine wilderness"
                  className="w-full p-3 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Category & Property Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ListingCategory)}
                  className="w-full p-3 border border-neutral-300 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                >
                  <option value="Beachfront">Beachfront</option>
                  <option value="Cabins">Cabins</option>
                  <option value="Iconic Cities">Iconic Cities</option>
                  <option value="Mansions">Mansions</option>
                  <option value="Treehouses">Treehouses</option>
                  <option value="Countryside">Countryside</option>
                  <option value="Lakefront">Lakefront</option>
                  <option value="Ryokans">Ryokans</option>
                  <option value="Tropical">Tropical</option>
                  <option value="Tiny Homes">Tiny Homes</option>
                  <option value="Skiing">Skiing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Property Type</label>
                <input
                  type="text"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder="e.g. Entire villa, Entire cabin"
                  className="w-full p-3 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <span className="block text-xs font-bold uppercase text-neutral-700">Location Coordinates</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="p-2.5 border border-neutral-300 rounded-xl text-xs bg-white"
                />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Santorini)"
                  className="p-2.5 border border-neutral-300 rounded-xl text-xs bg-white"
                />
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country (e.g. Greece)"
                  className="p-2.5 border border-neutral-300 rounded-xl text-xs bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude (e.g. 36.4618)"
                  className="p-2.5 border border-neutral-300 rounded-xl bg-white"
                />
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude (e.g. 25.3753)"
                  className="p-2.5 border border-neutral-300 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Nightly Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Cleaning Fee (₹)</label>
                <input
                  type="number"
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Max Guests</label>
                <input
                  type="number"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Select High-Resolution Photo */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-2">
                Curated High-Res Cover Imagery
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[
                  { img: goaVillaImg, label: 'Goa' },
                  { img: manaliChaletImg, label: 'Manali' },
                  { img: udaipurHaveliImg, label: 'Udaipur' },
                  { img: munnarTreehouseImg, label: 'Munnar' },
                  { img: jaipurHaveliImg, label: 'Jaipur' }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => {
                      setSelectedImage(item.img);
                      setCustomImageUrl('');
                    }}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 aspect-4/3 relative transition-all ${
                      selectedImage === item.img && !customImageUrl
                        ? 'border-neutral-900 ring-2 ring-neutral-900 scale-102'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the architectural soul of your space, morning light, kitchen amenities, and surrounding natural highlights..."
                className="w-full p-3 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-2">Amenities Included</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'wifi', label: 'Wi-Fi' },
                  { id: 'pool', label: 'Pool' },
                  { id: 'kitchen', label: 'Kitchen' },
                  { id: 'hot_tub', label: 'Hot Tub' },
                  { id: 'air_conditioning', label: 'AC' },
                  { id: 'workspace', label: 'Workspace' },
                  { id: 'free_parking', label: 'Parking' },
                  { id: 'fireplace', label: 'Fireplace' }
                ].map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                      selectedAmenities.includes(amenity.id)
                        ? 'border-neutral-900 bg-neutral-50 font-semibold'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="rounded text-neutral-900"
                    />
                    <span>{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-wait text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-98"
              >
                {isPublishing ? 'Publishing…' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
