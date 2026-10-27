import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { CategoryBar } from './components/CategoryBar.tsx';
import { ListingCard } from './components/ListingCard.tsx';
import { MapView } from './components/MapView.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { FilterModal } from './components/FilterModal.tsx';
import { ListingDetailModal } from './components/ListingDetailModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { WriteReviewModal } from './components/WriteReviewModal.tsx';
import { TripsView } from './components/TripsView.tsx';
import { WishlistView } from './components/WishlistView.tsx';
import { HostDashboard } from './components/HostDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';

import { Listing, Booking, Review, FilterState, User } from './types/index.ts';
import { api } from './services/api.ts';
import { Map, List, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function App() {
  // App brand name state (customizable and persistent)
  const [appName, setAppName] = useState<string>(() => {
    try {
      return localStorage.getItem('wanderlust_app_name') || 'WonderStay';
    } catch {
      return 'WonderStay';
    }
  });

  // Sync browser document title with current app name
  useEffect(() => {
    document.title = appName === 'WonderStay' ? 'WonderStay' : `${appName} - WonderStay`;
  }, [appName]);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<'explore' | 'trips' | 'wishlist' | 'host'>('explore');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Core Data state
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(api.getAuthToken()));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingAuthenticatedView, setPendingAuthenticatedView] = useState<'trips' | 'host' | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(api.getUserBookings(currentUser.id));
  const [allBookings, setAllBookings] = useState<Booking[]>(api.getHostBookings());
  const [wishlist, setWishlist] = useState<string[]>(api.getWishlist());
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingsLoadError, setListingsLoadError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    destination: '',
    checkIn: null,
    checkOut: null,
    guests: { adults: 1, children: 0, infants: 0 },
    priceRange: [2000, 50000],
    propertyType: null,
    bedrooms: null,
    amenities: [],
    displayTotalBeforeTaxes: false
  });

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDates, setBookingDates] = useState({ checkIn: '', checkOut: '' });
  const [bookingGuests, setBookingGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStayDate, setReviewStayDate] = useState('');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    let isMounted = true;
    const refreshData = async () => {
      setIsLoadingListings(true);
      try {
        const restoredUser = await api.restoreSession();
        if (isMounted && restoredUser) {
          setCurrentUser(restoredUser);
          setIsAuthenticated(true);
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
        await api.refreshDataFromApi();
        if (!isMounted) return;
        setListings(api.getListings());
        setFilteredListings(api.getListings());
        setBookings(restoredUser ? api.getUserBookings(restoredUser.id) : []);
        setAllBookings(api.getHostBookings());
        setWishlist(api.getWishlist());
        setListingsLoadError(null);
      } catch (error) {
        if (isMounted) {
          setListings([]);
          setListingsLoadError(error instanceof Error ? error.message : 'Could not load listings.');
        }
      } finally {
        if (isMounted) setIsLoadingListings(false);
      }
    };

    refreshData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    api.searchListings(filters)
      .then((results) => {
        if (isCurrent) {
          setFilteredListings(results);
          setListingsLoadError(null);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setListingsLoadError(error instanceof Error ? error.message : 'Could not search listings.');
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [filters]);

  // Wishlist listings
  const wishlistListings = useMemo(() => {
    return listings.filter(l => wishlist.includes(l.id));
  }, [listings, wishlist]);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.destination) count++;
    if (filters.checkIn || filters.checkOut) count++;
    if (filters.guests.adults > 1 || filters.guests.children > 0) count++;
    if (filters.priceRange[0] > 2000 || filters.priceRange[1] < 50000) count++;
    if (filters.propertyType) count++;
    if (filters.bedrooms) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    return count;
  }, [filters]);

  // Handlers
  const handleToggleWishlist = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    const added = api.toggleWishlist(listingId);
    setWishlist(api.getWishlist());
    showToast(added ? 'Saved to your wishlist' : 'Removed from wishlist');
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthAction = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(api.getCurrentUser());
    setBookings([]);
    setAllBookings([]);
    setCurrentView('explore');
    showToast('You have been signed out.');
  };

  const handleNavigate = (view: 'explore' | 'trips' | 'wishlist' | 'host') => {
    if ((view === 'trips' || view === 'host') && !isAuthenticated) {
      setPendingAuthenticatedView(view);
      openAuthModal();
      return;
    }
    if (view === 'host' && currentUser.role !== 'host') {
      showToast('A host account is required to access the host dashboard.');
      return;
    }
    setCurrentView(view);
  };

  const handleAuthenticate = async (
    mode: 'login' | 'register',
    credentials: { name: string; email: string; password: string; role: 'guest' | 'host' }
  ): Promise<User> => {
    const user = mode === 'login'
      ? await api.login(credentials.email, credentials.password)
      : await api.register(credentials.name, credentials.email, credentials.password, credentials.role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setBookings([]);
    setAllBookings([]);

    const pendingView = pendingAuthenticatedView;
    setPendingAuthenticatedView(null);
    if (pendingView === 'trips' || (pendingView === 'host' && user.role === 'host')) {
      setCurrentView(pendingView);
    } else if (pendingView === 'host') {
      showToast('Create a host account to access the host dashboard.');
    }

    try {
      await api.refreshDataFromApi();
      setListings(api.getListings());
      setFilteredListings(await api.searchListings(filters));
      setBookings(api.getUserBookings(user.id));
      setAllBookings(api.getHostBookings());
    } catch (error) {
      showToast(error instanceof Error
        ? `Signed in, but account data could not be refreshed: ${error.message}`
        : 'Signed in, but account data could not be refreshed.');
    }
    return user;
  };

  const handleResetData = async () => {
    try {
      await api.refreshDataFromApi();
      setListings(api.getListings());
      setFilteredListings(await api.searchListings(filters));
      setBookings(api.getUserBookings(currentUser.id));
      setAllBookings(api.getHostBookings());
      setListingsLoadError(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not refresh live data.');
      return;
    }
    setFilters({
      category: 'All',
      destination: '',
      checkIn: null,
      checkOut: null,
      guests: { adults: 1, children: 0, infants: 0 },
      priceRange: [2000, 50000],
      propertyType: null,
      bedrooms: null,
      amenities: [],
      displayTotalBeforeTaxes: false
    });
    showToast('Live listings and reservations refreshed.');
  };

  const handleStartBooking = (
    checkIn: string,
    checkOut: string,
    guests: { adults: number; children: number; infants: number }
  ) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setBookingDates({ checkIn, checkOut });
    setBookingGuests(guests);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async (newBooking: Booking) => {
    setBookings(api.getUserBookings(currentUser.id));
    setAllBookings(api.getHostBookings());
    showToast(`Reservation ${newBooking.id} successfully confirmed!`);
    try {
      await api.refreshDataFromApi();
      setBookings(api.getUserBookings(currentUser.id));
      setAllBookings(api.getHostBookings());
    } catch (error) {
      showToast(error instanceof Error
        ? `Reservation confirmed, but account data could not be refreshed: ${error.message}`
        : 'Reservation confirmed, but account data could not be refreshed.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.cancelBooking(bookingId);
      setBookings(api.getUserBookings(currentUser.id));
      setAllBookings(api.getHostBookings());
      showToast('Reservation cancelled. The dates are now freed for other guests.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not cancel this reservation.');
    }
  };

  const handleOpenReview = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!selectedListing) return;
    try {
      const eligibility = await api.getReviewEligibility(selectedListing.id);
      if (!eligibility.eligible || !eligibility.stayDate) {
        showToast(eligibility.alreadyReviewed
          ? 'You have already reviewed this stay.'
          : 'A review is available after you complete a stay at this property.');
        return;
      }
      setReviewStayDate(eligibility.stayDate);
      setIsReviewModalOpen(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not verify review eligibility.');
    }
  };

  const handleSubmitReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
    await api.createReview(reviewData);
    try {
      await api.refreshDataFromApi();
      setListings(api.getListings());
      setFilteredListings(await api.searchListings(filters));
      if (selectedListing) {
        const updated = api.getListingById(selectedListing.id);
        if (updated) setSelectedListing(updated);
      }
      showToast('Thank you! Your verified review and rating have been posted.');
    } catch (error) {
      showToast(error instanceof Error
        ? `Review saved, but listing data could not be refreshed: ${error.message}`
        : 'Review saved, but listing data could not be refreshed.');
    }
  };

  const handleCreateListing = async (listingData: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'ratingsBreakdown'>) => {
    const created = await api.createListing(listingData);
    showToast(`"${created.title}" is now live on Wanderlust!`);
    try {
      await api.refreshDataFromApi();
      setListings(api.getListings());
      setFilteredListings(await api.searchListings(filters));
    } catch (error) {
      showToast(error instanceof Error
        ? `Listing published, but marketplace data could not be refreshed: ${error.message}`
        : 'Listing published, but marketplace data could not be refreshed.');
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await api.deleteListing(id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not delete this listing.');
      return;
    }
    showToast('Listing removed from marketplace.');
    try {
      await api.refreshDataFromApi();
      setListings(api.getListings());
      setFilteredListings(await api.searchListings(filters));
    } catch (error) {
      showToast(error instanceof Error
        ? `Listing deleted, but marketplace data could not be refreshed: ${error.message}`
        : 'Listing deleted, but marketplace data could not be refreshed.');
    }
  };

  const currentReviews = selectedListing
    ? api.getReviewsForListing(selectedListing.id)
    : [];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigate={handleNavigate}
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        onAuthAction={handleAuthAction}
        onResetData={handleResetData}
        appName={appName}
        tripCount={bookings.filter(b => b.status === 'confirmed').length}
        wishlistCount={wishlist.length}
        searchSummary={{
          destination: filters.destination || undefined,
          dates: filters.checkIn && filters.checkOut ? `${filters.checkIn.slice(5)} - ${filters.checkOut.slice(5)}` : undefined,
          guests: filters.guests.adults + filters.guests.children > 1 ? filters.guests.adults + filters.guests.children : undefined
        }}
      />

      {/* Main Content Area by View */}
      {currentView === 'explore' && (
        <>
          {/* Category Icon Strip & Tax Switch */}
          <CategoryBar
            selectedCategory={filters.category}
            onSelectCategory={(cat) => setFilters(prev => ({ ...prev, category: cat }))}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            filterCount={activeFilterCount}
            displayTotalBeforeTaxes={filters.displayTotalBeforeTaxes}
            onToggleDisplayTotal={() =>
              setFilters(prev => ({ ...prev, displayTotalBeforeTaxes: !prev.displayTotalBeforeTaxes }))
            }
          />

          {/* Active Filter Pill Bar if destination/dates active */}
          {(filters.destination || filters.checkIn || filters.propertyType || filters.amenities.length > 0) && (
            <div className="bg-neutral-50/80 border-b border-neutral-200/60 py-2.5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-neutral-500 font-medium">Filtering by:</span>
                  {filters.destination && (
                    <span className="bg-white border border-neutral-200 px-2.5 py-1 rounded-full font-semibold text-neutral-800">
                      Destination: {filters.destination}
                    </span>
                  )}
                  {filters.checkIn && filters.checkOut && (
                    <span className="bg-white border border-neutral-200 px-2.5 py-1 rounded-full font-semibold text-neutral-800">
                      Dates: {filters.checkIn} to {filters.checkOut}
                    </span>
                  )}
                  {filters.propertyType && (
                    <span className="bg-white border border-neutral-200 px-2.5 py-1 rounded-full font-semibold text-neutral-800">
                      Type: {filters.propertyType}
                    </span>
                  )}
                  {filters.amenities.map(a => (
                    <span key={a} className="bg-white border border-neutral-200 px-2.5 py-1 rounded-full font-medium text-neutral-700 capitalize">
                      {a.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setFilters({
                    category: 'All',
                    destination: '',
                    checkIn: null,
                    checkOut: null,
                    guests: { adults: 1, children: 0, infants: 0 },
                    priceRange: [2000, 50000],
                    propertyType: null,
                    bedrooms: null,
                    amenities: [],
                    displayTotalBeforeTaxes: filters.displayTotalBeforeTaxes
                  })}
                  className="text-neutral-600 hover:text-neutral-900 font-semibold underline shrink-0 ml-4 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Listings or Map Body */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            {viewMode === 'grid' ? (
              <>
                {isLoadingListings ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 max-w-xl mx-auto px-6 mt-4">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
                    <h3 className="text-base font-bold text-neutral-900">Loading stays from the live API</h3>
                    <p className="text-xs text-neutral-500 mt-1">Fetching the latest listings, filters, and availability.</p>
                  </div>
                ) : listingsLoadError ? (
                  <div role="alert" className="text-center py-20 bg-rose-50 rounded-3xl border border-rose-200 max-w-xl mx-auto px-6 mt-4">
                    <h3 className="text-base font-bold text-rose-900">Could not load stays</h3>
                    <p className="text-xs text-rose-700 mt-1">{listingsLoadError}</p>
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 max-w-xl mx-auto px-6 mt-4">
                    <h3 className="text-base font-bold text-neutral-900">No stays match your criteria</h3>
                    <p className="text-xs text-neutral-500 mt-1 mb-6">
                      Try removing some filters, adjusting your price range, or searching for a different destination.
                    </p>
                    <button
                      onClick={() => setFilters({
                        category: 'All',
                        destination: '',
                        checkIn: null,
                        checkOut: null,
                        guests: { adults: 1, children: 0, infants: 0 },
                        priceRange: [2000, 50000],
                        propertyType: null,
                        bedrooms: null,
                        amenities: [],
                        displayTotalBeforeTaxes: filters.displayTotalBeforeTaxes
                      })}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        isWishlisted={wishlist.includes(listing.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onClick={(l) => setSelectedListing(l)}
                        displayTotalBeforeTaxes={filters.displayTotalBeforeTaxes}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Map View */
              <div className="h-[calc(100vh-210px)] min-h-[500px] w-full">
                <MapView
                  listings={filteredListings}
                  selectedListingId={selectedListing?.id || null}
                  onSelectListing={(l) => setSelectedListing(l)}
                />
              </div>
            )}
          </main>

          {/* Floating Show Map / Show List Button */}
          <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={() => setViewMode(prev => prev === 'grid' ? 'map' : 'grid')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {viewMode === 'grid' ? (
                <>
                  <span>Show map</span>
                  <Map className="w-4 h-4 stroke-[2.5]" />
                </>
              ) : (
                <>
                  <span>Show list</span>
                  <List className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Trips View */}
      {currentView === 'trips' && (
        <TripsView
          bookings={bookings}
          onCancelBooking={handleCancelBooking}
          onOpenListing={(id) => {
            const match = listings.find(l => l.id === id);
            if (match) setSelectedListing(match);
          }}
          onBackToExplore={() => setCurrentView('explore')}
        />
      )}

      {/* Wishlist View */}
      {currentView === 'wishlist' && (
        <WishlistView
          wishlistListings={wishlistListings}
          isWishlisted={(id) => wishlist.includes(id)}
          onToggleWishlist={handleToggleWishlist}
          onSelectListing={(l) => setSelectedListing(l)}
          onBackToExplore={() => setCurrentView('explore')}
          displayTotalBeforeTaxes={filters.displayTotalBeforeTaxes}
        />
      )}

      {/* Host Dashboard View */}
      {currentView === 'host' && isAuthenticated && currentUser.role === 'host' && (
        <HostDashboard
          currentUser={currentUser}
          allListings={listings}
          allBookings={allBookings}
          onCreateListing={handleCreateListing}
          onDeleteListing={handleDeleteListing}
          onSelectListing={(l) => setSelectedListing(l)}
          onBackToExplore={() => setCurrentView('explore')}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-neutral-800">© 2026 {appName}, Inc.</span>
            <span>·</span>
            <button onClick={() => setCurrentView('explore')} className="hover:underline">Privacy</button>
            <span>·</span>
            <button onClick={() => setCurrentView('explore')} className="hover:underline">Terms</button>
          </div>

          <div className="flex items-center gap-6 font-semibold text-neutral-700">
            <span>English (IN)</span>
            <span>₹ INR</span>
            {(!isAuthenticated || currentUser.role === 'host') && (
              <button
                onClick={() => currentUser.role === 'host' && isAuthenticated
                  ? handleNavigate('host')
                  : openAuthModal('register')}
                className="text-rose-600 hover:underline"
              >
                {currentUser.role === 'host' && isAuthenticated ? 'Host dashboard' : `Host on ${appName}`}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        filters={filters}
        onApplySearch={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
        onResetFilters={() => setFilters(prev => ({
          ...prev,
          priceRange: [2000, 50000],
          propertyType: null,
          bedrooms: null,
          amenities: []
        }))}
      />

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          currentUser={currentUser}
          isWishlisted={wishlist.includes(selectedListing.id)}
          onToggleWishlist={handleToggleWishlist}
          onStartBooking={handleStartBooking}
          onOpenReviewModal={handleOpenReview}
          reviews={currentReviews}
        />
      )}

      {selectedListing && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          listing={selectedListing}
          checkIn={bookingDates.checkIn}
          checkOut={bookingDates.checkOut}
          guestsCount={bookingGuests}
          onBookingSuccess={handleBookingSuccess}
          onViewTrips={() => handleNavigate('trips')}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthenticatedView(null);
        }}
        onAuthenticate={handleAuthenticate}
      />

      {selectedListing && (
        <WriteReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          listingId={selectedListing.id}
          listingTitle={selectedListing.title}
          currentUser={currentUser}
          stayDate={reviewStayDate}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
}
