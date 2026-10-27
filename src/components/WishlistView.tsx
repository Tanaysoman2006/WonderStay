import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Listing } from '../types/index.ts';
import { ListingCard } from './ListingCard.tsx';

interface WishlistViewProps {
  wishlistListings: Listing[];
  isWishlisted: (id: string) => boolean;
  onToggleWishlist: (e: React.MouseEvent, id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onBackToExplore: () => void;
  displayTotalBeforeTaxes: boolean;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistListings,
  isWishlisted,
  onToggleWishlist,
  onSelectListing,
  onBackToExplore,
  displayTotalBeforeTaxes
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div>
          <button
            onClick={onBackToExplore}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to explore stays</span>
          </button>
          <h1 className="text-3xl font-bold text-neutral-900">Your Wishlists</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Hand-picked collection of dreamy architecture and stays saved for future trips.
          </p>
        </div>
      </div>

      {wishlistListings.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200/80 max-w-xl mx-auto px-6">
          <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">Your wishlist is empty</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
            Tap the heart icon on any stay card while browsing to save it to your wishlist.
          </p>
          <button
            onClick={onBackToExplore}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Explore trending stays
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isWishlisted={isWishlisted(listing.id)}
              onToggleWishlist={onToggleWishlist}
              onClick={onSelectListing}
              displayTotalBeforeTaxes={displayTotalBeforeTaxes}
            />
          ))}
        </div>
      )}
    </div>
  );
};
