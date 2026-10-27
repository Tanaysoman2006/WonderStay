import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Star,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  Wifi,
  Waves,
  UtensilsCrossed,
  Flame,
  Car,
  Zap,
  Wind,
  Laptop,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Listing, User, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { formatINR } from '../utils/formatCurrency.ts';

const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps will not load.');
      reject(new Error('Missing Google Maps API key'));
      return;
    }

    if (window.google?.maps) {
      resolve();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
      return;
    }

    if (script.dataset.loaded === 'true') {
      resolve();
      return;
    }

    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')), { once: true });
  });
};

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  currentUser: User;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, listingId: string) => void;
  onStartBooking: (checkIn: string, checkOut: string, guests: { adults: number; children: number; infants: number }) => void;
  onOpenReviewModal: () => void;
  reviews: Review[];
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  currentUser,
  isWishlisted,
  onToggleWishlist,
  onStartBooking,
  onOpenReviewModal,
  reviews
}) => {
  if (!listing) return null;

  // Selected reservation dates
  const today = new Date();
  const defaultCheckIn = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const defaultCheckOut = new Date(today.getTime() + 11 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Check date availability and conflicts
  const [availability, setAvailability] = useState<{ available: boolean; conflict?: { checkIn: string; checkOut: string }; error?: string } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isCurrent = true;
    setAvailability(null);
    api.getListingAvailability(listing.id, checkIn, checkOut)
      .then((result) => {
        if (isCurrent) setAvailability(result);
      })
      .catch((error) => {
        if (isCurrent) setAvailability({
          available: false,
          error: error instanceof Error ? error.message : 'Could not verify availability.',
        });
      });
    return () => {
      isCurrent = false;
    };
  }, [checkIn, checkOut, listing.id]);

  // Google Maps location map on the detail page
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !mapContainerRef.current || !window.google?.maps) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: listing.location.lat, lng: listing.location.lng },
            zoom: 13,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
        }

        const map = mapInstanceRef.current;

        new window.google.maps.Marker({
          position: { lat: listing.location.lat, lng: listing.location.lng },
          map,
          title: listing.title,
          icon: {
            path: 'M 0,0 L 22,0 L 22,18 L 11,32 L 0,18 Z',
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1,
            labelOrigin: new window.google.maps.Point(11, 9)
          },
          label: {
            text: `${formatINR(listing.price)} · Stay`,
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700'
          }
        });
      })
      .catch(() => {
        if (isMounted) {
          console.warn('Google Maps could not be loaded for the detail modal.');
        }
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [listing.id, listing.location.lat, listing.location.lng, listing.price, listing.title]);

  // Pricing calculations
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  const subtotal = listing.price * nights;
  const serviceFee = Math.round(subtotal * listing.serviceFeePercent);
  const taxes = Math.round((subtotal + listing.cleaningFee + serviceFee) * 0.05);
  const total = subtotal + listing.cleaningFee + serviceFee + taxes;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const amenityIconMap: Record<string, any> = {
    wifi: { label: 'Fast Wi-Fi (150 Mbps)', icon: Wifi },
    pool: { label: 'Private Heated Pool', icon: Waves },
    kitchen: { label: 'Chef-grade Kitchen', icon: UtensilsCrossed },
    hot_tub: { label: 'Private Hot Tub / Whirlpool', icon: Sparkles },
    fireplace: { label: 'Indoor Fireplace', icon: Flame },
    free_parking: { label: 'Free Parking on Premises', icon: Car },
    ev_charger: { label: 'EV Charger (Level 2)', icon: Zap },
    air_conditioning: { label: 'Air Conditioning', icon: Wind },
    workspace: { label: 'Dedicated Workspace & Desk', icon: Laptop },
    sauna: { label: 'Nordic Cedar Sauna', icon: Flame },
    patio: { label: 'Outdoor Patio & Lounge', icon: Sparkles },
    coffee_maker: { label: 'Espresso & Pour-over Coffee Bar', icon: UtensilsCrossed }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-neutral-200/90 my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky top action header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {listing.category}
            </span>
            <span className="text-sm font-semibold text-neutral-800 truncate">
              {listing.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Share stay"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isCopied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={(e) => onToggleWishlist(e, listing.id)}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Save to wishlist"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'
                }`}
              />
              <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Title & Metadata */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-600 font-medium">
              <div className="flex items-center gap-1 text-neutral-900 font-bold">
                <Star className="w-4 h-4 fill-neutral-900 text-neutral-900" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="text-neutral-500 font-normal">({listing.reviewCount} reviews)</span>
              </div>
              <span aria-hidden="true">·</span>
              {listing.host.superhost && (
                <>
                  <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                    <Award className="w-4 h-4 text-rose-500" />
                    <span>Superhost</span>
                  </div>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="underline cursor-pointer">{listing.location.address}, {listing.location.city}, {listing.location.country}</span>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 rounded-2xl overflow-hidden aspect-16/10 md:aspect-2/1">
            <div className="md:col-span-2 relative h-full">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2.5 h-full">
              {listing.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative h-full overflow-hidden bg-neutral-100">
                  <img
                    src={img}
                    alt={`${listing.title} view ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main 2-Column Split: Stay Details on Left, Booking Box on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2 Cols: Details, Amenities, Host, Description */}
            <div className="lg:col-span-2 space-y-7">
              {/* Host Summary */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {listing.propertyType} hosted by {listing.host.name}
                  </h3>
                  <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                    <span>{listing.maxGuests} guests</span>
                    <span aria-hidden="true">·</span>
                    <span>{listing.bedrooms} bedrooms</span>
                    <span aria-hidden="true">·</span>
                    <span>{listing.beds} beds</span>
                    <span aria-hidden="true">·</span>
                    <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={listing.host.avatar}
                    alt={listing.host.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  {listing.host.superhost && (
                    <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-sm">
                      <Award className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-4 pb-6 border-b border-neutral-200 text-sm">
                <div className="flex items-start gap-3.5">
                  <Award className="w-5 h-5 text-neutral-800 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-neutral-900">{listing.host.name} is a Superhost</h4>
                    <p className="text-xs text-neutral-500">
                      Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-neutral-800 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-neutral-900">Exceptional Location</h4>
                    <p className="text-xs text-neutral-500">
                      100% of recent guests gave the location a 5-star rating.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Calendar className="w-5 h-5 text-neutral-800 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-neutral-900">Free Cancellation</h4>
                    <p className="text-xs text-neutral-500">
                      {listing.cancellationPolicy}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pb-6 border-b border-neutral-200">
                <h3 className="text-base font-bold text-neutral-900 mb-3">About this space</h3>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="pb-6 border-b border-neutral-200">
                <h3 className="text-base font-bold text-neutral-900 mb-4">What this place offers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
                  {listing.amenities.map((amenityKey) => {
                    const item = amenityIconMap[amenityKey] || {
                      label: amenityKey.replace('_', ' '),
                      icon: Sparkles
                    };
                    const Icon = item.icon;
                    return (
                      <div key={amenityKey} className="flex items-center gap-3 text-neutral-800">
                        <Icon className="w-5 h-5 text-neutral-600 shrink-0" />
                        <span className="text-xs font-medium capitalize">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Location Map */}
              <div className="pb-6 border-b border-neutral-200">
                <h3 className="text-base font-bold text-neutral-900 mb-2">Where you'll be</h3>
                <p className="text-xs text-neutral-500 mb-4">
                  {listing.location.city}, {listing.location.country} {listing.location.neighborhood ? `· ${listing.location.neighborhood}` : ''}
                </p>
                <div className="h-64 w-full rounded-2xl overflow-hidden border border-neutral-200">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Booking Widget (Module 3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-5">
                {/* Price Header */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-neutral-900 tabular-nums">
                      {formatINR(listing.price)}
                    </span>
                    <span className="text-xs text-neutral-500">night</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
                    <span>{listing.rating.toFixed(2)}</span>
                    <span className="text-neutral-500 font-normal">({listing.reviewCount})</span>
                  </div>
                </div>

                {/* Date & Guest Selectors */}
                <div className="border border-neutral-300 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-2 divide-x divide-neutral-300 border-b border-neutral-300">
                    <div className="p-2.5">
                      <label className="block text-[10px] font-bold uppercase text-neutral-500">CHECK-IN</label>
                      <input
                        type="date"
                        value={checkIn}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full font-semibold text-neutral-900 focus:outline-none mt-0.5 bg-transparent"
                      />
                    </div>
                    <div className="p-2.5">
                      <label className="block text-[10px] font-bold uppercase text-neutral-500">CHECKOUT</label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full font-semibold text-neutral-900 focus:outline-none mt-0.5 bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-2.5">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500">GUESTS</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-semibold text-neutral-900">{adults + children} guests</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(listing.maxGuests, adults + 1))}
                          className="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlap Availability Badge */}
                {availability && !availability.available ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{availability.error ? 'Availability could not be checked' : 'Dates not available'}</span>
                      <p className="text-[11px] mt-0.5">
                        {availability.error || `These dates overlap with another booked stay (${availability.conflict?.checkIn} to ${availability.conflict?.checkOut}).`}
                      </p>
                    </div>
                  </div>
                ) : availability?.available ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Dates available · No conflicts</span>
                  </div>
                ) : (
                  <div className="text-center text-xs text-neutral-500">Checking date availability…</div>
                )}

                {/* Reserve Action Button */}
                <button
                  type="button"
                  disabled={!availability?.available}
                  onClick={() => onStartBooking(checkIn, checkOut, { adults, children, infants: 0 })}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm shadow-md transition-all active:scale-98"
                >
                  Reserve Stay
                </button>

                <p className="text-center text-[11px] text-neutral-500">
                  You won't be charged yet
                </p>

                {/* Itemized Pricing */}
                <div className="space-y-2 pt-3 border-t border-neutral-200 text-xs text-neutral-700">
                  <div className="flex justify-between">
                    <span className="underline">{formatINR(listing.price)} x {nights} nights</span>
                    <span className="tabular-nums font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span className="tabular-nums font-medium">{formatINR(listing.cleaningFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Service fee ({Math.round(listing.serviceFeePercent * 100)}%)</span>
                    <span className="tabular-nums font-medium">{formatINR(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Taxes & GST (5%)</span>
                    <span className="tabular-nums font-medium">{formatINR(taxes)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-900 font-bold text-sm pt-3 border-t border-neutral-200">
                    <span>Total including taxes</span>
                    <span className="tabular-nums text-rose-600">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module 4: Verified Reviews & Aggregation Section */}
          <div className="pt-8 border-t border-neutral-200 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-neutral-900 text-neutral-900" />
                <h3 className="text-xl font-bold text-neutral-900">
                  {listing.rating.toFixed(2)} · {listing.reviewCount} reviews
                </h3>
              </div>

              <button
                onClick={onOpenReviewModal}
                className="px-4 py-2 border border-neutral-900 rounded-xl text-xs font-bold text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                Write a Review
              </button>
            </div>

            {/* 6 Category Rating Breakdown Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-xs">
              {[
                { label: 'Cleanliness', val: listing.ratingsBreakdown.cleanliness },
                { label: 'Accuracy', val: listing.ratingsBreakdown.accuracy },
                { label: 'Communication', val: listing.ratingsBreakdown.communication },
                { label: 'Location', val: listing.ratingsBreakdown.location },
                { label: 'Check-in', val: listing.ratingsBreakdown.checkIn },
                { label: 'Value', val: listing.ratingsBreakdown.value }
              ].map((cat) => (
                <div key={cat.label} className="flex items-center justify-between gap-4">
                  <span className="font-medium text-neutral-700 w-28">{cat.label}</span>
                  <div className="flex-1 bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 h-full rounded-full"
                      style={{ width: `${(cat.val / 5) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold tabular-nums text-neutral-900 w-6 text-right">
                    {cat.val.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="space-y-2 p-4 bg-neutral-50/70 rounded-2xl border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.authorAvatar}
                      alt={rev.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{rev.authorName}</h4>
                      <p className="text-[11px] text-neutral-500">
                        {rev.date} · {rev.stayDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
