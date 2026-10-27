import React from 'react';
import { Calendar, MapPin, AlertCircle, ArrowLeft, Star, CheckCircle2 } from 'lucide-react';
import { Booking } from '../types/index.ts';
import { formatINR } from '../utils/formatCurrency.ts';

interface TripsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onOpenListing: (listingId: string) => void;
  onBackToExplore: () => void;
}

export const TripsView: React.FC<TripsViewProps> = ({
  bookings,
  onCancelBooking,
  onOpenListing,
  onBackToExplore
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
          <h1 className="text-3xl font-bold text-neutral-900">Your Trips</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your upcoming getaways, view itinerary details, and cancel if plans shift.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200/80 max-w-xl mx-auto px-6">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">No trips booked yet... yet!</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
            Time to dust off your bags and start planning your next architectural adventure across the world.
          </p>
          <button
            onClick={onBackToExplore}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Start searching stays
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking.id}
                className={`flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border transition-all ${
                  isCancelled
                    ? 'bg-neutral-50 border-neutral-200 opacity-60'
                    : 'bg-white border-neutral-200 hover:shadow-lg'
                }`}
              >
                <div className="sm:w-48 h-40 rounded-xl overflow-hidden bg-neutral-100 shrink-0 relative">
                  <img
                    src={booking.listingImage}
                    alt={booking.listingTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2">
                    {isCancelled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-800 text-white">
                        Cancelled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span className="font-mono font-semibold">Ref: {booking.id}</span>
                      <span className="tabular-nums font-medium">
                        {booking.nights} night{booking.nights > 1 ? 's' : ''}
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenListing(booking.listingId)}
                      className="text-base font-bold text-neutral-900 hover:text-rose-600 cursor-pointer line-clamp-1"
                    >
                      {booking.listingTitle}
                    </h3>

                    <p className="text-xs text-neutral-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {booking.listingCity}, {booking.listingCountry}
                    </p>

                    <div className="mt-3 p-2 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                      <div className="flex items-center justify-between text-neutral-700 font-semibold">
                        <span>Check-in: {booking.checkIn}</span>
                        <span>Checkout: {booking.checkOut}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500 mt-1 text-[11px]">
                        <span>Guests: {booking.guestsCount.adults + booking.guestsCount.children}</span>
                        <span className="font-bold text-neutral-900">Total: {formatINR(booking.totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => onOpenListing(booking.listingId)}
                      className="text-xs font-semibold text-neutral-800 hover:underline"
                    >
                      View property
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel reservation ${booking.id}? The reserved dates will be immediately freed for other travelers.`)) {
                            onCancelBooking(booking.id);
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Cancel reservation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
