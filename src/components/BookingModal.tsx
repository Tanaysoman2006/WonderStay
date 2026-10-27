import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Calendar, Users, MapPin } from 'lucide-react';
import { Listing, Booking } from '../types/index.ts';
import { api } from '../services/api.ts';
import { formatINR } from '../utils/formatCurrency.ts';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  checkIn: string;
  checkOut: string;
  guestsCount: { adults: number; children: number; infants: number };
  onBookingSuccess: (booking: Booking) => Promise<void>;
  onViewTrips: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  listing,
  checkIn,
  checkOut,
  guestsCount,
  onBookingSuccess,
  onViewTrips
}) => {
  const [step, setStep] = useState<'checkout' | 'confirmed'>('checkout');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate pricing
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const subtotal = listing.price * nights;
  const cleaningFee = listing.cleaningFee;
  const serviceFee = Math.round(subtotal * listing.serviceFeePercent);
  const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.05);
  const totalPrice = subtotal + cleaningFee + serviceFee + taxes;

  const totalGuests = (guestsCount.adults || 1) + (guestsCount.children || 0);

  const handleConfirmAndPay = async () => {
    setIsProcessing(true);
    setConflictError(null);
    try {
      const booking = await api.createBooking({
        listingId: listing.id,
        checkIn,
        checkOut,
        guestsCount,
      });
      setConfirmedBooking(booking);
      setStep('confirmed');
      await onBookingSuccess(booking);
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : 'Failed to complete booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {step === 'checkout' ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Confirm reservation</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              {/* Conflict Alert if any */}
              {conflictError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Booking Conflict</p>
                    <p className="mt-0.5">{conflictError}</p>
                  </div>
                </div>
              )}

              {/* Listing Overview Card */}
              <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                    {listing.propertyType}
                  </p>
                  <h4 className="text-sm font-bold text-neutral-900 truncate mt-0.5">
                    {listing.title}
                  </h4>
                  <p className="text-xs text-neutral-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    {listing.location.city}, {listing.location.country}
                  </p>
                  <p className="text-xs text-neutral-700 font-semibold mt-1">
                    ★ {listing.rating.toFixed(2)} ({listing.reviewCount} reviews) · {listing.host.superhost ? 'Superhost' : 'Verified'}
                  </p>
                </div>
              </div>

              {/* Trip Details */}
              <div className="border border-neutral-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Your trip details
                </h4>
                <div className="flex items-center justify-between text-sm py-1 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span className="font-medium text-neutral-800">Dates</span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {checkIn} to {checkOut} ({nights} night{nights > 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-500" />
                    <span className="font-medium text-neutral-800">Guests</span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {totalGuests} guest{totalGuests > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-neutral-200 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Price details
                </h4>
                <div className="flex justify-between text-neutral-700">
                  <span>{formatINR(listing.price)} x {nights} nights</span>
                  <span className="font-medium tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Cleaning fee</span>
                  <span className="font-medium tabular-nums">{formatINR(cleaningFee)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Service fee ({Math.round(listing.serviceFeePercent * 100)}%)</span>
                  <span className="font-medium tabular-nums">{formatINR(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Taxes & GST (5%)</span>
                  <span className="font-medium tabular-nums">{formatINR(taxes)}</span>
                </div>
                <div className="flex justify-between text-neutral-900 font-bold text-sm pt-2 border-t border-neutral-200">
                  <span>Total (INR)</span>
                  <span className="tabular-nums text-rose-600 font-bold">{formatINR(totalPrice)}</span>
                </div>
              </div>

              <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>This project currently confirms demo reservations only. No payment is collected; connect a payment provider before enabling real charges.</p>
              </div>

              {/* Ground rules & policy */}
              <div className="text-[11px] text-neutral-500 space-y-1">
                <p>
                  By selecting the button below, I agree to the Host's House Rules, Ground Rules for Guests, and Wanderlust's Rebooking & Refund Policy.
                </p>
                <p className="font-medium text-neutral-700">
                  Free cancellation up to 48 hours before check-in.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/80">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md transition-all active:scale-98 flex items-center gap-2"
              >
                {isProcessing ? (
                  <span>Securing your reservation...</span>
                ) : (
                  <span>Confirm demo reservation · {formatINR(totalPrice)}</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-neutral-900">Reservation Confirmed!</h3>
              <p className="text-sm text-neutral-500 mt-1">
                You are heading to <span className="font-semibold text-neutral-800">{listing.location.city}</span>!
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Reservation Code</span>
                <span className="font-mono font-bold text-neutral-900">{confirmedBooking?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Property</span>
                <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dates</span>
                <span className="font-semibold text-neutral-800">{checkIn} to {checkOut} ({nights} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Booking total</span>
                <span className="font-bold text-emerald-700">{formatINR(confirmedBooking?.totalPrice ?? totalPrice)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400">No payment was processed for this demo reservation.</p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-neutral-300 hover:border-neutral-900 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Keep Exploring
              </button>
              <button
                onClick={() => {
                  onClose();
                  onViewTrips();
                }}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                View in My Trips
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
