import React from 'react';
import {
  Waves,
  TreePine,
  Building2,
  Castle,
  Mountain,
  Compass,
  Sparkles,
  Palmtree,
  Box,
  Snowflake,
  SlidersHorizontal
} from 'lucide-react';
import { ListingCategory } from '../types/index.ts';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenFilterModal: () => void;
  filterCount: number;
  displayTotalBeforeTaxes: boolean;
  onToggleDisplayTotal: () => void;
}

interface CategoryItem {
  id: ListingCategory | 'All';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'All', label: 'All Stays', icon: Compass },
  { id: 'Beachfront', label: 'Beachfront', icon: Waves },
  { id: 'Cabins', label: 'Cabins', icon: TreePine },
  { id: 'Iconic Cities', label: 'Iconic Cities', icon: Building2 },
  { id: 'Mansions', label: 'Mansions', icon: Castle },
  { id: 'Treehouses', label: 'Treehouses', icon: TreePine },
  { id: 'Countryside', label: 'Countryside', icon: Mountain },
  { id: 'Lakefront', label: 'Lakefront', icon: Compass },
  { id: 'Heritage Havelis', label: 'Heritage Havelis', icon: Castle },
  { id: 'Tropical', label: 'Tropical', icon: Palmtree },
  { id: 'Tiny Homes', label: 'Tiny Homes', icon: Box },
  { id: 'Skiing', label: 'Skiing', icon: Snowflake }
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenFilterModal,
  filterCount,
  displayTotalBeforeTaxes,
  onToggleDisplayTotal
}) => {
  return (
    <div className="bg-white border-b border-neutral-200/80 sticky top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Scrolling category strip */}
          <div className="flex items-center gap-7 overflow-x-auto no-scrollbar scroll-smooth py-1 pr-4">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 pb-2 border-b-2 text-xs font-medium whitespace-nowrap transition-all duration-150 group shrink-0 ${
                    isSelected
                      ? 'border-neutral-900 text-neutral-900 font-semibold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                      isSelected ? 'text-neutral-900 stroke-[2]' : 'text-neutral-500 stroke-[1.6]'
                    }`}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Tools: Filters Button & Taxes Toggle */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 pl-2 border-l border-neutral-200">
            <button
              onClick={onOpenFilterModal}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 hover:border-neutral-900 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {filterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                  {filterCount}
                </span>
              )}
            </button>

            {/* Display total before taxes switch */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 hover:border-neutral-400 transition-colors">
              <span className="whitespace-nowrap">Display total before taxes</span>
              <button
                type="button"
                role="switch"
                aria-checked={displayTotalBeforeTaxes}
                onClick={onToggleDisplayTotal}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  displayTotalBeforeTaxes ? 'bg-neutral-900' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    displayTotalBeforeTaxes ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile filter button */}
          <div className="lg:hidden shrink-0">
            <button
              onClick={onOpenFilterModal}
              className="p-2 border border-neutral-300 rounded-xl text-neutral-700 relative hover:border-neutral-800 transition-colors"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {filterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] flex items-center justify-center font-bold">
                  {filterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
