
import React from 'react';
import { Star, Wifi, UtensilsCrossed, Shirt, X, ChevronDown } from 'lucide-react';

interface FilterState {
  rating: number;
  facilities: {
    wifi: boolean;
    food: boolean;
    laundry: boolean;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

interface SortOption {
  value: string;
  label: string;
}

interface FilterSortProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

const FilterSort: React.FC<FilterSortProps> = ({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  totalResults
}) => {
  const sortOptions: SortOption[] = [
    { value: 'default', label: 'Default' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' },
    { value: 'name_a_z', label: 'Name: A to Z' },
    { value: 'name_z_a', label: 'Name: Z to A' },
  ];

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating
    });
  };

  const handleFacilityChange = (facility: keyof FilterState['facilities']) => {
    onFiltersChange({
      ...filters,
      facilities: {
        ...filters.facilities,
        [facility]: !filters.facilities[facility]
      }
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: value
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      rating: 0,
      facilities: {
        wifi: false,
        food: false,
        laundry: false
      },
      priceRange: {
        min: 1000,
        max: 50000
      }
    });
  };

  const hasActiveFilters = () => {
    return filters.rating > 0 || 
           Object.values(filters.facilities).some(v => v) || 
           filters.priceRange.min !== 1000 || 
           filters.priceRange.max !== 50000;
  };

  return (
    <div className="flex gap-6">
      {/* Left Side - Filters */}
      <div className="w-80 bg-white rounded-lg shadow-md p-6 h-fit">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Rating Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Rating</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
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
                <span className="text-sm text-gray-600">& above</span>
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Facilities</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.facilities.wifi}
                onChange={() => handleFacilityChange('wifi')}
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
                onChange={() => handleFacilityChange('food')}
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
                onChange={() => handleFacilityChange('laundry')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">Laundry</span>
              </div>
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                  min="1000"
                  max="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                  min="1000"
                  max="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content Area */}
      <div className="flex-1">
        {/* Sort Options */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalResults > 0 && `${totalResults} results found`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* This is where your hostel cards will go */}
        <div id="hostel-cards-container">
          {/* Hostel cards will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default FilterSort;