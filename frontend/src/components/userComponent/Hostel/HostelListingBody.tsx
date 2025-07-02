import React, { useEffect, useState } from 'react';
import { Wifi, RefreshCw, ArrowLeft, Search, Home, UtensilsCrossed, Shirt, MapPin, Star, Users, Phone, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToWishlist, checkWishlists, deleteWishlist, getHostels } from '../../../hooks/userHooks';


interface Facilities {
  wifi: boolean;
  food: boolean;
  laundry: boolean;
}

interface Hostel {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  price: string;
  occupancy: string;
  contact: string;
  facilities: Facilities;
  photos: string;
}

interface HostelData {
  _id: string;
  hostelname: string;
  location: string;
  bedShareRoom: string;
  phone: string;
  facilities: string;
  photos: string[];
  beds: string;
}

interface FacilityBadgeProps {
  icon: React.ReactNode;
  label: string;
  available: boolean;
  color: 'green' | 'blue' | 'purple';
}

interface HostelCardProps {
  hostel: Hostel;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalResults: number;
  isSearching: boolean;
}

// Search Bar Component
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, totalResults, isSearching }) => {
  return (
    <div className="mb-8">
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search hostels by name, location, or facilities..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-700 bg-white shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Search Status */}
        {searchTerm && (
          <div className="mt-3 text-center">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Searching...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {totalResults > 0 
                  ? `Found ${totalResults} hostel${totalResults > 1 ? 's' : ''} matching "${searchTerm}"`
                  : `No hostels found matching "${searchTerm}"`
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
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 rounded-lg border transition-all duration-200 ${currentPage === 1
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
          }`}
      >
        <ChevronLeft size={16} className="mr-1" />
        Prev
      </button>

      {/* Page Numbers */}
      {generatePageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 min-w-[40px] ${currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 rounded-lg border transition-all duration-200 ${currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
          }`}
      >
        Next
        <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
};

// FacilityBadge Component
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

// HostelCard Component
const HostelCard: React.FC<HostelCardProps> = ({ hostel }) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/user/singlehostel/${hostel.id}`);
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
      const response = await checkWishlists(hostel.id)
      console.log(response.data.message)
      if (response.data.message == 'Already Exist') {
        setIsLiked(true)
      }
    }
    checkWishlist()
  }, [])

  const handleLikeClick = async () => {
    setIsLiked(!isLiked);
    console.log("Liked:", isLiked)
    if (!isLiked) {
      try {
        const response = await addToWishlist(hostel.id);
        console.log(response.data.message);

        if (response.data.message === 'Added to wishlist') {
          toast.success("Added to wishlist!");
        }
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        toast.error("Failed to add to wishlist.");
      }
    } else {
      try {
        const response = await deleteWishlist(hostel.id);
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

  return (
    <div
      onClick={handleClick}
      className="w-full max-w-sm bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={hostel.photos || "/api/placeholder/400/250"}
          alt={hostel.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <button
          onClick={(e) => checkWishlist({ hostelId: hostel.id }, e)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart
            size={20}
            className={`${isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>

        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ₹{hostel.price}/month
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{hostel.name}</h3>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-600">
              {hostel.rating || "No Ratings"} ({hostel.reviews || "No Reviews"})
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin size={16} className="mr-1" />
          <span>{hostel.address}</span>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>{hostel.occupancy || "N/A"} per room</span>
          </div>
          <div className="flex items-center">
            <Phone size={16} className="mr-1" />
            <span>{hostel.contact}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FacilityBadge
            icon={<Wifi size={14} />}
            label="WiFi"
            available={hostel.facilities?.wifi}
            color="green"
          />
          <FacilityBadge
            icon={<UtensilsCrossed size={14} />}
            label="Food"
            available={hostel.facilities?.food}
            color="blue"
          />
          <FacilityBadge
            icon={<Shirt size={14} />}
            label="Laundry"
            available={hostel.facilities?.laundry}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ isSearching, searchTerm }: { isSearching?: boolean; searchTerm?: string }) => {
  const navigate = useNavigate();

  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Animated Illustration Container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-full">
          <div className="relative animate-bounce">
            <Home className="w-16 h-16 text-blue-500" />
            <div className="absolute -top-1 -right-1">
              <Search className="w-6 h-6 text-blue-700 animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center max-w-md mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-fade-in">
          {searchTerm ? 'No Matching Hostels' : 'No Hostels Found'}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {searchTerm 
            ? `We couldn't find any hostels matching "${searchTerm}". Try adjusting your search terms or browse all available hostels.`
            : "We couldn't find any hostels at the moment. Don't worry - new listings are added frequently. Try refreshing or head back to explore other options."
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/user/home')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-5 h-5" />
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

// Main HostelCardGrid Component
const HostelCardGrid: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalHostels, setTotalHostels] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const ITEMS_PER_PAGE = 6;

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

  const fetchHostels = async (page: number = 1, limit: number = ITEMS_PER_PAGE, search: string = '') => {
    try {
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

      const response = await getHostels(params)
      const data = response.data.response;

      const hostelData = data.hostels;
      const total = data.totalCount;
      const pages = Math.ceil(total / limit);

      const formattedHostels = hostelData.map((item: HostelData) => {
        let facilitiesArray: string[] = [];

        if (Array.isArray(item.facilities) && item.facilities.length === 1) {
          facilitiesArray = item.facilities[0]
            .split(',')
            .map((facility: string) => facility.trim().toLowerCase());
        } else if (Array.isArray(item.facilities)) {
          facilitiesArray = item.facilities.map((f: string) => f.trim().toLowerCase());
        } else if (typeof item.facilities === 'string') {
          facilitiesArray = item.facilities.split(',').map((f: string) => f.trim().toLowerCase());
        }

        const facilitiesObj = {
          wifi: facilitiesArray.includes('wifi'),
          food: facilitiesArray.includes('food'),
          laundry: facilitiesArray.includes('laundry')
        };

        return {
          id: item._id,
          name: item.hostelname,
          address: item.location,
          price: item.bedShareRoom,
          contact: item.phone,
          facilities: facilitiesObj,
          photos: item.photos[0] || '',
          occupancy: item.beds
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
    fetchHostels(1, ITEMS_PER_PAGE);
  }, []);

  // Search effect
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    
  
    fetchHostels(1, ITEMS_PER_PAGE, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchHostels(page, ITEMS_PER_PAGE, searchTerm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
   
    setCurrentPage(1);
  };

  if (loading && !isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
       
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 pt-20">
      <div className="container mx-auto px-4 max-w-[75%]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {searchTerm ? 'Search Results' : 'View Perfect Hostel'}
          </h1>
          {totalHostels > 0 && (
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalHostels)} of {totalHostels} hostels
            </div>
          )}
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalResults={totalHostels}
          isSearching={isSearching}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.length > 0 ? (
            hostels.map((hostel, index) => <HostelCard key={hostel.id} hostel={hostel} />)
          ) : (
            <EmptyState isSearching={isSearching} searchTerm={searchTerm} />
          )}
        </div>

        {hostels.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default HostelCardGrid;