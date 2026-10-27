import React, { useState } from 'react';
import { X, Wifi, Waves, UtensilsCrossed, Flame, Car, Zap, Wind, Laptop, Sparkles } from 'lucide-react';
import { FilterState } from '../types/index.ts';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'Fast Wi-Fi', icon: Wifi },
  { id: 'pool', label: 'Private Pool', icon: Waves },
  { id: 'kitchen', label: 'Full Kitchen', icon: UtensilsCrossed },
  { id: 'hot_tub', label: 'Hot Tub / Whirlpool', icon: Sparkles },
  { id: 'air_conditioning', label: 'Air Conditioning', icon: Wind },
  { id: 'workspace', label: 'Dedicated Workspace', icon: Laptop },
  { id: 'free_parking', label: 'Free Parking on Premises', icon: Car },
  { id: 'ev_charger', label: 'EV Charger', icon: Zap },
  { id: 'fireplace', label: 'Indoor Fireplace', icon: Flame },
  { id: 'sauna', label: 'Sauna', icon: Flame }
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters
}) => {
  const [minPrice, setMinPrice] = useState(filters.priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1]);
  const [propertyType, setPropertyType] = useState<string | null>(filters.propertyType);
  const [bedrooms, setBedrooms] = useState<number | null>(filters.bedrooms);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities);

  if (!isOpen) return null;

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      priceRange: [minPrice, maxPrice],
      propertyType,
      bedrooms,
      amenities: selectedAmenities
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice(2000);
    setMaxPrice(50000);
    setPropertyType(null);
    setBedrooms(null);
    setSelectedAmenities([]);
    onResetFilters();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200/90 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold text-neutral-900">Filters</h3>
          <div className="w-8" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1">
          {/* Price Range */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-1">Price range</h4>
            <p className="text-xs text-neutral-500 mb-4">Nightly prices before taxes and fees</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-neutral-900">
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase">Minimum</label>
                <div className="flex items-center mt-1">
                  <span className="text-neutral-500 mr-1">₹</span>
                  <input
                    type="number"
                    value={minPrice}
                    min={0}
                    max={maxPrice}
                    step={500}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 border border-neutral-300 rounded-xl focus-within:ring-2 focus-within:ring-neutral-900">
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase">Maximum</label>
                <div className="flex items-center mt-1">
                  <span className="text-neutral-500 mr-1">₹</span>
                  <input
                    type="number"
                    value={maxPrice}
                    min={minPrice}
                    max={100000}
                    step={1000}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Type of Place */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-3">Type of place</h4>
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-xl">
              {['Any', 'Entire place', 'Private room'].map((type) => {
                const isSelected = (!propertyType && type === 'Any') || propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type === 'Any' ? null : type)}
                    className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Bedrooms */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-3">Bedrooms</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[null, 1, 2, 3, 4, 5].map((num) => {
                const isSelected = bedrooms === num;
                return (
                  <button
                    key={num === null ? 'any' : num}
                    type="button"
                    onClick={() => setBedrooms(num)}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
                    }`}
                  >
                    {num === null ? 'Any' : `${num}+`}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Amenities */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-3">Amenities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const Icon = amenity.icon;
                const isChecked = selectedAmenities.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-neutral-900 bg-neutral-50/80'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300"
                    />
                    <Icon className="w-4 h-4 text-neutral-700" />
                    <span className="text-xs font-medium text-neutral-800">{amenity.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};
