import React from 'react';
import { Wifi, UtensilsCrossed, Shirt, Star, X } from 'lucide-react';
import { FilterState } from '../../interface/FilterState';

interface FilterComponentProps {
  filters: FilterState;
  onRatingChange: (rating: number) => void;
  onFacilityChange: (facility: keyof FilterState['facilities']) => void;
  onPriceChange: (type: 'min' | 'max', value: number) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: () => boolean;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  filters,
  onRatingChange,
  onFacilityChange,
  onPriceChange,
  onClearAllFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Filters
        </h2>
        {hasActiveFilters() && (
          <button
            onClick={onClearAllFilters}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                filters.rating === rating
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Facilities</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.facilities.wifi}
              onChange={() => onFacilityChange('wifi')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">WiFi</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.facilities.food}
              onChange={() => onFacilityChange('food')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Food</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.facilities.laundry}
              onChange={() => onFacilityChange('laundry')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-700">Laundry</span>
            </div>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Min Price</label>
              <input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) => onPriceChange('min', Number(e.target.value))}
                min="0"
                max="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max Price</label>
              <input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) => onPriceChange('max', Number(e.target.value))}
                min="0"
                max="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹50,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;