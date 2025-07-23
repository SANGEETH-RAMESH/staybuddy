import React, { useEffect, useState } from 'react';
import { Wifi, RefreshCw, ArrowLeft, Filter, Search, Home, UtensilsCrossed, Shirt, MapPin, Star, Users, Phone, Heart, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToWishlist, checkWishlists, removeFromWishlist, getHostels } from '../../../services/userServices';
import LocationPicker from '../../commonComponents/locationPicker';
import { Hostel } from '../../../interface/Hostel';
import { SearchBarProps } from '../../../interface/Search';
import { FacilityBadgeProps } from '../../../interface/FacilityBadgeProps';
import { FilterState } from '../../../interface/FilterState';
import { PaginationProps } from '../../../interface/PaginationProps';
import { Facilities } from '../../../interface/Facilities';
import FilterComponent from '../../commonComponents/FilterComponent';

interface HostelCardProps {
  hostel: Hostel;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onRatingChange: (rating: number) => void;
  onFacilityChange: (facility: keyof FilterState['facilities']) => void;
  onPriceChange: (type: 'min' | 'max', value: number) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: () => boolean;
}


const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onRatingChange,
  onFacilityChange,
  onPriceChange,
  onClearAllFilters,
  hasActiveFilters
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <FilterComponent
            filters={filters}
            onRatingChange={onRatingChange}
            onFacilityChange={onFacilityChange}
            onPriceChange={onPriceChange}
            onClearAllFilters={onClearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, totalResults, isSearching }) => {
  return (
    <div className="mb-4 flex justify-end">
      <div className="relative w-full sm:w-80 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search hostels..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-300 text-sm bg-white shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg p-2 shadow-sm z-10">
            {isSearching ? (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Searching...</span>
              </div>
            ) : (
              <p className="text-xs text-gray-600">
                {totalResults > 0
                  ? `${totalResults} result${totalResults > 1 ? 's' : ''}`
                  : 'No results found'
                }
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-6 sm:mt-8 px-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-2 sm:px-3 py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm 
          ${currentPage === 1
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
          }`}
      >
        <ChevronLeft size={14} className="mr-1" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-[200px] sm:max-w-none">
        {generatePageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 sm:px-3 py-2 text-gray-500 text-xs sm:text-sm">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-2 sm:px-3 py-2 rounded-lg border transition-all duration-200 min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm 
                  ${currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                  }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-2 sm:px-3 py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm ${currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
          }`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={14} className="ml-1" />
      </button>
    </div>
  );
};

const FacilityBadge: React.FC<FacilityBadgeProps> = ({ icon, label, available, color }) => {
  const colors: Record<string, string> = {
    green: available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400',
    blue: available ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400',
    purple: available ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400',
  };

  return (
    <div
      className={`flex items-center space-x-1 rounded-full px-3 py-1 ${colors[color]}`}
      title={`${label} ${available ? 'Available' : 'Not Available'}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

const HostelCard: React.FC<HostelCardProps> = ({ hostel }) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/singlehostel/${hostel._id}`);
  };

  const checkWishlist = async ({ hostelId }: { hostelId: string }, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const response = await checkWishlists(hostelId);
      console.log(response.data.message)
      if (response.data.message == 'Already Exist') {
        setIsLiked(true)
      }
      handleLikeClick()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const checkWishlist = async () => {
      const response = await checkWishlists(hostel._id)
      console.log(response.data.message)
      if (response.data.message == 'Already Exist') {
        setIsLiked(true)
      }
    }
    checkWishlist()
  }, [])

  const handleLikeClick = async () => {
    setIsLiked(!isLiked);
    console.log("Liked:", isLiked, hostel)
    if (!isLiked) {
      try {
        const response = await addToWishlist(hostel._id);
        console.log(response.data.message, 'dsfljdsfsdf');

        if (response.data.message === 'Added to wishlist') {
          toast.success("Added to wishlist!");
        }
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        toast.error("Failed to add to wishlist.");
      }
    } else {
      try {
        const response = await removeFromWishlist(hostel._id);
        console.log(response.data.message, 'removed');

        if (response.data.message === 'Hostel Removed From Wishlist') {
          toast.success("Removed from wishlist!");
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove from wishlist.");
      }
    }
  };

  const isFacilities = (facilities: any): facilities is Facilities => {
    return (
      facilities &&
      typeof facilities === "object" &&
      "wifi" in facilities &&
      "food" in facilities &&
      "laundry" in facilities
    );
  };

  const facilitiesList = Array.isArray(hostel.facilities)
    ? hostel.facilities
    : typeof hostel.facilities === "string"
      ? hostel.facilities.split(",").map(f => f.trim().toLowerCase())
      : [];

  const hasFacility = (name: string) => facilitiesList.includes(name.toLowerCase());

  return (
    <div
      onClick={handleClick}
      className="w-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={hostel.photos || "/api/placeholder/400/250"}
          alt={hostel.hostelname}
          className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
        />
        <button
          onClick={(e) => checkWishlist({ hostelId: hostel._id }, e)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart
            size={20}
            className={`${isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>

        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ₹{hostel.bedShareRoom}/month
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-1">
            {hostel.hostelname}
          </h3>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-600">
              {hostel.rating || "No Ratings"}
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{hostel.address}</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-2">
              <div className={`relative w-3 h-3 rounded-full ${hostel.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                {hostel.isActive && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse"></div>
                )}
              </div>
              <span className={`text-sm font-semibold ${hostel.isActive ? 'text-green-700' : 'text-red-700'}`}>
                {hostel.isActive ? 'Active' : 'Inactive'}
              </span>
            </div> */}

            {/* Status Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${hostel.isActive
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
              {hostel.isActive ? '✓ Available' : '✗ Unavailable'}
            </div>
          </div>
        </div>

        {/* Enhanced inactive reason display */}
        {!hostel.isActive && hostel.inactiveReason && (
          <div className="mb-3 relative">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-3 rounded-r-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-900 mb-1 uppercase tracking-wide">
                    Temporarily Unavailable
                  </p>
                  <p className="text-sm text-red-800 leading-relaxed">
                    {hostel.inactiveReason}
                  </p>
                </div>
              </div>

              {/* Subtle decorative element */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-red-300 rounded-full opacity-50"></div>
              <div className="absolute top-4 right-3 w-1 h-1 bg-red-300 rounded-full opacity-30"></div>
            </div>
          </div>
        )}


        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>{hostel.beds || 0} per room</span>
          </div>
          <div className="flex items-center">
            <Phone size={16} className="mr-1" />
            <span>{hostel.contact}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2">
          <FacilityBadge
            icon={<Wifi size={12} />}
            label="WiFi"
            available={
              hostel.facilities
                ? isFacilities(hostel.facilities)
                  ? hostel.facilities.wifi
                  : hasFacility("wifi")
                : false
            }
            color="green"
          />
          <FacilityBadge
            icon={<UtensilsCrossed size={14} />}
            label="Food"
            available={
              hostel.facilities
                ? isFacilities(hostel.facilities)
                  ? hostel.facilities.food
                  : hasFacility("food")
                : false
            }
            color="blue"
          />
          <FacilityBadge
            icon={<Shirt size={14} />}
            label="Laundry"
            available={
              hostel.facilities
                ? isFacilities(hostel.facilities)
                  ? hostel.facilities.laundry
                  : hasFacility("laundry")
                : false
            }
            color="purple"
          />
        </div>
        {hostel.cancellationPolicy === 'freecancellation' && (
          <div className="mt-3 flex items-center gap-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
              ✓ Free Cancellation
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ isSearching, searchTerm }: { isSearching?: boolean; searchTerm?: string }) => {
  const navigate = useNavigate();
  console.log(isSearching, 'dfs')
  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] p-4 sm:p-8"> {/* Responsive height and padding */}

      <div className="relative mb-6 sm:mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-full">
          <div className="relative animate-bounce">
            <Home className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />
            <div className="absolute -top-1 -right-1">
              <Search className="w-4 h-4 sm:w-6 sm:h-6 text-blue-700 animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center max-w-sm sm:max-w-md mb-6 sm:mb-8 px-4">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 animate-fade-in">
          {searchTerm ? 'No Matching Hostels' : 'No Hostels Found'}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {searchTerm
            ? `We couldn't find any hostels matching "${searchTerm}". Try adjusting your search terms or browse all available hostels.`
            : "We couldn't find any hostels at the moment. Don't worry - new listings are added frequently. Try refreshing or head back to explore other options."
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Home
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          Refresh Page
        </button>
      </div>


      {/* Suggested Actions */}
      <div className="mt-8 text-sm text-gray-500 space-y-2">
        {searchTerm ? (
          <>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Try different search keywords
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Check spelling or use shorter terms
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Browse all hostels without filters
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Try adjusting your search criteria
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Check back later for new listings
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Contact support if you need assistance
            </p>
          </>
        )}
      </div>

      {/* Optional: Add this style block in your CSS file */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const HostelCardGrid: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalHostels, setTotalHostels] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLat, setSelectedLat] = useState<number>(0);
  const [selectedLng, setSelectedLng] = useState<number>(0);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    rating: 0,
    facilities: {
      wifi: false,
      food: false,
      laundry: false
    },
    priceRange: {
      min: 0,
      max: 50000
    }
  });
  const [sortOption, setSortOption] = useState<string>('default');

  const ITEMS_PER_PAGE = 6;

  const getCurrentLocation = () => {
    setCurrentLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLat(latitude);
          setSelectedLng(longitude);
          setUseCurrentLocation(true)

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`
            );
            const data = await res.json();
            const address = data.dispaly_name || 'Current location';
            setSelectedLocation(address);
          } catch (error) {
            console.log(error);
            setSelectedLocation('Current location');
          }

          setCurrentLocationLoading(false);
          fetchHostels(1, ITEMS_PER_PAGE, searchTerm, latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocationLoading(false);
          toast.error('Unable to get your current location')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setCurrentLocationLoading(false);
      toast.error('Geolocation is not supported by this browser');
    }
  }

  const handleLocationSelect = (location: string, lat: number, lng: number) => {
    setSelectedLocation(location);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setUseCurrentLocation(false);
    fetchHostels(1, ITEMS_PER_PAGE, searchTerm, lat, lng);
  };

  const clearLocationFilter = () => {
    setSelectedLocation('');
    setSelectedLat(0);
    setSelectedLng(0);
    setUseCurrentLocation(false);
    setShowLocationPicker(false);
    fetchHostels(1, ITEMS_PER_PAGE, searchTerm);
  };

  const LocationFilter = () => {
    return (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filter by Location</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={getCurrentLocation}
              disabled={currentLocationLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {currentLocationLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              Use Current Location
            </button>
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Pick from Map
            </button>
            {(selectedLocation || useCurrentLocation) && (
              <button
                onClick={clearLocationFilter}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {selectedLocation && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {useCurrentLocation ? 'Current Location: ' : 'Selected Location: '}
                {selectedLocation}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Showing hostels within 10km radius
            </p>
          </div>
        )}

        {/* Location Picker */}
        {showLocationPicker && (
          <div className="mb-4">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                initialLatitude={selectedLat}
                initialLongitude={selectedLng}
                hostels={hostels}
              />
            </div>
            {/* Add legend */}
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded-full border border-white"></div>
                <span>Selected Location</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center text-white text-xs">🏠</div>
                <span>Available Hostels</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);


      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchHostels = async (page: number = 1, limit: number = ITEMS_PER_PAGE,
    search: string = '', lat?: number, lng?: number,
    filterParams?: FilterState, sort?: string) => {
    try {
      console.log(filterParams, sort, 'sangeeethethet')
      setLoading(page === 1);
      if (search) {
        setIsSearching(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (lat && lng) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
        params.append('radius', '10');
      }

      if (filterParams) {
        if (filterParams.rating) {
          params.append('rating', filterParams.rating.toString());
        }

        Object.entries(filterParams.facilities).forEach(([key, value]) => {
          if (value) {
            params.append('facilities', key);
          }
        });

        if (filterParams.priceRange) {
          params.append('minPrice', filterParams.priceRange.min.toString());
          params.append('maxPrice', filterParams.priceRange.max.toString());
        }
      }

      if (sort && sort !== 'default') {
        params.append('sort', sort);
      }

      const response = await getHostels(params)
      const data = response.data.response;
      console.log(data, 'dataaaaa')


      const hostelData = data.hostels;
      const total = data.totalCount;
      const pages = Math.ceil(total / limit);

      const formattedHostels = hostelData.map((item: Hostel) => {
        const facilitiesArray: string[] = Array.isArray(item.facilities)
          ? item.facilities.map((f: string) => f.trim().toLowerCase())
          : [];

        const facilitiesObj = {
          wifi: facilitiesArray.includes('wifi'),
          food: facilitiesArray.includes('food'),
          laundry: facilitiesArray.includes('laundry'),
        };

        return {
          _id: item._id,
          hostelname: item.hostelname,
          address: item.location,
          bedShareRoom: item.bedShareRoom,
          contact: item.phone,
          facilities: facilitiesObj,
          photos: item.photos[0] || '',
          beds: item.beds,
          rating: item.rating,
          isActive: item.isActive,
          inactiveReason: item.inactiveReason,
          latitude: item.latitude,
          longitude: item.longitude,
          cancellationPolicy: item.cancellationPolicy
        };
      });

      setHostels(formattedHostels);
      setTotalHostels(total);
      setTotalPages(pages);
      setCurrentPage(page);
      setLoading(false);
      setIsSearching(false);
    } catch (err) {
      setError('Failed to fetch hostels');
      setLoading(false);
      setIsSearching(false);
      console.error('Error fetching hostels:', err);
    }
  };


  useEffect(() => {
    fetchHostels(1, ITEMS_PER_PAGE, '', 0, 0, filters, sortOption);
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;


    fetchHostels(1, ITEMS_PER_PAGE, debouncedSearchTerm, selectedLat, selectedLng, filters, sortOption);
  }, [debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchHostels(page, ITEMS_PER_PAGE, searchTerm, selectedLat, selectedLng, filters, sortOption);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchHostels(1, ITEMS_PER_PAGE, searchTerm, selectedLat, selectedLng, newFilters, sortOption);
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    setCurrentPage(1);
    fetchHostels(1, ITEMS_PER_PAGE, searchTerm, selectedLat, selectedLng, filters, newSort);
  };

  // Add these helper functions inside your HostelCardGrid component:

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' },
    { value: 'name_a_z', label: 'Name: A to Z' },
    { value: 'name_z_a', label: 'Name: Z to A' },
  ];

  const handleRatingChange = (rating: number) => {
    const newFilters = {
      ...filters,
      rating: filters.rating === rating ? 0 : rating
    };
    setFilters(newFilters);
    handleFiltersChange(newFilters);
  };

  const handleFacilityChange = (facility: keyof FilterState['facilities']) => {
    const newFilters = {
      ...filters,
      facilities: {
        ...filters.facilities,
        [facility]: !filters.facilities[facility]
      }
    };
    setFilters(newFilters);
    handleFiltersChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newFilters = {
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: value
      }
    };
    setFilters(newFilters);
    handleFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      rating: 0,
      facilities: {
        wifi: false,
        food: false,
        laundry: false
      },
      priceRange: {
        min: 0,
        max: 50000
      }
    };
    setFilters(defaultFilters);
    handleFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.rating > 0 ||
      Object.values(filters.facilities).some(v => v) ||
      filters.priceRange.min !== 1000 ||
      filters.priceRange.max !== 50000;
  };

  // if (loading && !isSearching) {
  //   return (
  //     <div className="mb-4 flex items-center justify-between">
  //       <div className="relative w-16 h-16">

  //         <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>

  //         <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }






  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12 pt-16 sm:pt-20">
      <div className="container mx-auto px-4 max-w-[95%] sm:max-w-[90%]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {searchTerm ? 'Search Results' : 'View Perfect Hostel'}
          </h1>
          {totalHostels > 0 && (
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalHostels)} of {totalHostels} hostels
            </div>
          )}
        </div>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalResults={totalHostels}
          isSearching={isSearching}
        />

        <LocationFilter />

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters() && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          </div>

          {/* Desktop Filters Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-full lg:w-64 bg-white rounded-lg shadow-md p-4 h-fit order-2 lg:order-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Filters
              </h2>
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
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(rating)}
                    className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${filters.rating === rating
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rating
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

            {/* Facilities Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Facilities</h3>
              <div className="space-y-2">
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
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', Number(e.target.value))}
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
                      onChange={(e) => handlePriceChange('max', Number(e.target.value))}
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

          <div className="flex-1 order-1 lg:order-2">
            {loading && !isSearching ? (
              // Loader UI
              <div className="mb-4 flex items-center justify-center h-40">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : (

              <>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {totalHostels > 0 && `${totalHostels} results found`}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">Sort by:</span>
                    <div className="relative">
                      <select
                        value={sortOption}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-6 sm:pr-8 text-xs sm:text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {hostels.length > 0 ? (
                    hostels.map((hostel, index) => (
                      <HostelCard key={index} hostel={hostel} />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState isSearching={isSearching} searchTerm={searchTerm} />
                    </div>
                  )}
                </div>

                {hostels.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {showFilterModal && (
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onRatingChange={handleRatingChange}
            onFacilityChange={handleFacilityChange}
            onPriceChange={handlePriceChange}
            onClearAllFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>
    </div>
  );
};

export default HostelCardGrid;