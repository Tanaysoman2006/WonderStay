import React, { useState } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '../types/index.ts';
import { formatINR } from '../utils/formatCurrency.ts';

interface ListingCardProps {
  listing: Listing;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, listingId: string) => void;
  onClick: (listing: Listing) => void;
  displayTotalBeforeTaxes: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isWishlisted,
  onToggleWishlist,
  onClick,
  displayTotalBeforeTaxes
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80'];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 3-night sample stay for total estimate calculation if displayTotalBeforeTaxes is on
  const estimatedNights = 3;
  const estimatedSubtotal = listing.price * estimatedNights;
  const estimatedTotal = estimatedSubtotal + listing.cleaningFee + Math.round(estimatedSubtotal * listing.serviceFeePercent);

  return (
    <div
      onClick={() => onClick(listing)}
      className="group cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-2xl"
    >
      {/* Media Aspect Ratio Container (4:3) */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-neutral-100 mb-3 shadow-xs">
        <img
          src={images[currentImageIndex]}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Resilient fallback container if external host fails
            const target = e.currentTarget;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => onToggleWishlist(e, listing.id)}
          className="absolute top-3 right-3 p-2 rounded-full text-white/90 hover:scale-110 active:scale-95 transition-transform z-10 focus:outline-none drop-shadow-md"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              isWishlisted
                ? 'fill-rose-500 text-rose-500 stroke-rose-500'
                : 'fill-black/30 text-white stroke-[2]'
            }`}
          />
        </button>

        {/* Superhost Badge */}
        {listing.host.superhost && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-neutral-900 shadow-sm uppercase tracking-wider">
            Superhost
          </div>
        )}

        {/* Carousel Navigation Arrows on Hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-md text-neutral-800 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-md text-neutral-800 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Carousel Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentImageIndex === idx
                    ? 'w-4 bg-white shadow-sm'
                    : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Information */}
      <div className="flex flex-col gap-0.5">
        {/* Title row with location and rating */}
        <div className="flex items-center justify-between text-[15px] font-semibold text-neutral-900 leading-snug">
          <span className="truncate pr-2">{listing.location.city}, {listing.location.country}</span>
          <div className="flex items-center gap-1 text-xs font-semibold tabular-nums shrink-0">
            <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
            <span>{listing.rating.toFixed(2)}</span>
            <span className="text-neutral-500 font-normal">({listing.reviewCount})</span>
          </div>
        </div>

        {/* Subtle metadata row */}
        <p className="text-sm text-neutral-500 truncate">
          {listing.propertyType} · {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}
        </p>
        <p className="text-xs text-neutral-400 truncate">
          {listing.tagline}
        </p>

        {/* Pricing row */}
        <div className="mt-1.5 flex items-baseline gap-1 text-neutral-900">
          {displayTotalBeforeTaxes ? (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tabular-nums">
                {formatINR(estimatedTotal)}{' '}
                <span className="text-xs font-normal text-neutral-600">total before taxes</span>
              </span>
              <span className="text-[11px] text-neutral-400">
                {formatINR(listing.price)} per night · {estimatedNights} nights est.
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-semibold tabular-nums">
                {formatINR(listing.price)}
              </span>
              <span className="text-xs text-neutral-600 font-normal">
                night
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
