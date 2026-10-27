import React, { useState } from 'react';
import { Search, X, MapPin, Calendar, Users, Plus, Minus } from 'lucide-react';
import { FilterState } from '../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplySearch: (updates: Partial<FilterState>) => void;
}

const POPULAR_DESTINATIONS = [
  { city: 'Goa', country: 'India', desc: 'Portuguese heritage villas & palm beaches' },
  { city: 'Manali', country: 'Himachal Pradesh, India', desc: 'Cedar A-frame chalets & snow peaks' },
  { city: 'Udaipur', country: 'Rajasthan, India', desc: 'Lake Pichola havelis & royal terraces' },
  { city: 'Munnar', country: 'Kerala, India', desc: 'Tea estate treehouses & mountain mist' },
  { city: 'Jaipur', country: 'Rajasthan, India', desc: 'Pink City royal courtyards & jharokhas' },
  { city: 'Rishikesh', country: 'Uttarakhand, India', desc: 'Ganges riverfront yoga retreats' },
  { city: 'Leh', country: 'Ladakh, India', desc: 'High-altitude stone lodges & starry skies' },
  { city: 'Coorg', country: 'Karnataka, India', desc: 'Lush coffee plantation estates' }
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplySearch
}) => {
  const [activeTab, setActiveTab] = useState<'destination' | 'dates' | 'guests'>('destination');
  const [destination, setDestination] = useState(filters.destination || '');
  const [checkIn, setCheckIn] = useState(filters.checkIn || '');
  const [checkOut, setCheckOut] = useState(filters.checkOut || '');
  const [adults, setAdults] = useState(filters.guests.adults || 1);
  const [children, setChildren] = useState(filters.guests.children || 0);
  const [infants, setInfants] = useState(filters.guests.infants || 0);

  if (!isOpen) return null;

  const handleSearch = () => {
    onApplySearch({
      destination,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: { adults, children, infants }
    });
    onClose();
  };

  const handleClear = () => {
    setDestination('');
    setCheckIn('');
    setCheckOut('');
    setAdults(1);
    setChildren(0);
    setInfants(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-center pt-10 sm:pt-20 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-neutral-200/80 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('destination')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'destination' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Where
            </button>
            <button
              onClick={() => setActiveTab('dates')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'dates' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              When
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'guests' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Who
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {activeTab === 'destination' && (
            <div>
              <div className="relative mb-6">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destinations (e.g. Greece, Norway, Bali, Kyoto...)"
                  className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-neutral-900 focus:outline-none placeholder:text-neutral-400"
                  autoFocus
                />
                {destination && (
                  <button
                    onClick={() => setDestination('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Popular Wanderlust Destinations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.city}
                      onClick={() => {
                        setDestination(dest.city);
                        setActiveTab('dates');
                      }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/80 text-left transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
                        <MapPin className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-neutral-900">
                          {dest.city}, {dest.country}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {dest.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dates' && (
            <div>
              <p className="text-sm text-neutral-600 mb-4">
                Select your intended arrival and departure dates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                    Check-in Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                    Check-out Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || undefined}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500 py-1.5">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const nextWeek = new Date(now.getTime() + 7 * 86400000);
                    const weekAfter = new Date(now.getTime() + 11 * 86400000);
                    setCheckIn(nextWeek.toISOString().split('T')[0]);
                    setCheckOut(weekAfter.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors"
                >
                  Next Weekend (4 nights)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const nextMonth = new Date(now.getTime() + 21 * 86400000);
                    const sevenDays = new Date(now.getTime() + 28 * 86400000);
                    setCheckIn(nextMonth.toISOString().split('T')[0]);
                    setCheckOut(sevenDays.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors"
                >
                  Full Week (7 nights)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="space-y-5">
              {/* Adults */}
              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Adults</h4>
                  <p className="text-xs text-neutral-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Children</h4>
                  <p className="text-xs text-neutral-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Infants</h4>
                  <p className="text-xs text-neutral-500">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{infants}</span>
                  <button
                    onClick={() => setInfants(infants + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900"
          >
            Clear all
          </button>

          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md transition-all active:scale-98"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search Stays</span>
          </button>
        </div>
      </div>
    </div>
  );
};
