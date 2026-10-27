import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Menu, Heart, Calendar, Home, LogOut, RefreshCw, UserCheck } from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  onOpenSearch: () => void;
  onNavigate: (view: 'explore' | 'trips' | 'wishlist' | 'host') => void;
  currentView: 'explore' | 'trips' | 'wishlist' | 'host';
  isAuthenticated: boolean;
  onAuthAction: () => void;
  onResetData: () => void;
  appName: string;
  onOpenRenameModal?: () => void;
  searchSummary?: {
    destination?: string;
    dates?: string;
    guests?: number;
  };
  tripCount: number;
  wishlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenSearch,
  onNavigate,
  currentView,
  isAuthenticated,
  onAuthAction,
  onResetData,
  appName,
  searchSummary,
  tripCount,
  wishlistCount
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const destinationText = searchSummary?.destination || 'Anywhere';
  const datesText = searchSummary?.dates || 'Any week';
  const guestsText = searchSummary?.guests ? `${searchSummary.guests} guests` : 'Add guests';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Zone 1: Brand Title & Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-2.5 text-rose-500 hover:text-rose-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg p-1"
              aria-label={`${appName} Home`}
            >
              {/* Custom geometric iconic logo */}
              <svg
                className="w-8 h-8 fill-current"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.18 12.656 7.643 16.094 1.706 4.008.874 8.163-2.128 10.366-2.585 1.897-6.071 1.79-9.14-.285l-.659-.462-.659.462c-3.069 2.075-6.555 2.182-9.14.285-3.002-2.203-3.834-6.358-2.128-10.366 1.463-3.438 5.689-12.264 7.643-16.094l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.353 0-2.327.608-3.327 2.457l-.547 1.054C10.155 10.4 5.96 19.165 4.542 22.493c-1.258 2.956-.575 5.908 1.579 7.491 1.91 1.402 4.595 1.341 7.027-.376l1.246-.932 1.606 1.144c2.432 1.717 5.117 1.778 7.027.376 2.154-1.583 2.837-4.535 1.579-7.491-1.418-3.328-5.613-12.093-7.584-15.982l-.547-1.054C18.327 3.608 17.353 3 16 3zm0 15c2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4s-4-1.791-4-4c0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-neutral-900 hidden sm:inline-block">
                {appName}
              </span>
            </button>
          </div>

          {/* Zone 2: Compact Search Bar Pill */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between pl-5 pr-2 py-2 border border-neutral-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 bg-white text-sm group"
            >
              <div className="flex items-center text-xs sm:text-sm font-medium text-neutral-800 divide-x divide-neutral-200">
                <span className="px-2 truncate max-w-[120px] font-semibold text-neutral-900">
                  {destinationText}
                </span>
                <span className="px-2 truncate max-w-[100px] text-neutral-600">
                  {datesText}
                </span>
                <span className="px-2 truncate text-neutral-500 font-normal">
                  {guestsText}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>

          {/* Zone 3: Actions & Profile Menu */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onAuthAction}
              className="text-xs sm:text-sm font-semibold px-3 py-2 rounded-full hover:bg-neutral-100 text-neutral-800 transition-colors whitespace-nowrap"
            >
              {isAuthenticated ? 'Sign out' : 'Sign in'}
            </button>

            <button
              onClick={() => onNavigate('wishlist')}
              className={`p-2.5 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors relative ${currentView === 'wishlist' ? 'bg-neutral-100 text-rose-500' : ''}`}
              title="Saved Wishlist"
              aria-label="Wishlists"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Profile Menu Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-neutral-300 rounded-full pl-3 pr-1.5 py-1.5 hover:shadow-md transition-shadow bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                aria-expanded={menuOpen}
                aria-label="Main navigation menu"
              >
                <Menu className="w-4 h-4 text-neutral-700" />
                <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-200 border border-neutral-200 shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </button>

              {/* Profile Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="font-semibold text-neutral-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>
                        {isAuthenticated
                          ? currentUser.role === 'host' ? 'Host account' : 'Guest account'
                          : 'Not signed in'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('trips');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        My Trips
                      </span>
                      {tripCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-600">
                          {tripCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('wishlist');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-neutral-500" />
                        Wishlists
                      </span>
                      {wishlistCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-700">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    {isAuthenticated && currentUser.role === 'host' && (
                      <button
                        onClick={() => {
                          onNavigate('host');
                          setMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
                      >
                        <Home className="w-4 h-4 text-neutral-500" />
                        Host Dashboard
                      </button>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 py-1">
                    <button
                      onClick={() => {
                        onAuthAction();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {isAuthenticated ? 'Sign out' : 'Sign in or create account'}
                    </button>

                    <button
                      onClick={() => {
                        onResetData();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-neutral-500 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                      Refresh Live Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Button */}
        <div className="md:hidden pb-3">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 px-4 py-2.5 border border-neutral-200 rounded-full shadow-sm bg-white text-sm"
          >
            <Search className="w-4 h-4 text-neutral-700 shrink-0" />
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-neutral-900 truncate">
                {destinationText}
              </span>
              <span className="text-[11px] text-neutral-500 truncate">
                {datesText} · {guestsText}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
