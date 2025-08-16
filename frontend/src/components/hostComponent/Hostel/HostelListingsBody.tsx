import React, { useEffect, useState } from 'react';
import { Search, ArrowLeft, RefreshCw, Wifi, UtensilsCrossed, Shirt, MapPin, Star, Users, Phone, Heart, Home, Edit, Trash2, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteHostel, getAllHostels } from '../../../services/hostServices';
import { SearchBarProps } from '../../../interface/Search';
import DeleteConfirmationModal from '../../commonComponents/DeleteConfirmationModal';



const ITEMS_PER_PAGE = 6;


interface Facilities  {
  wifi: boolean;
  food: boolean;
  laundry: boolean;
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface Hostel {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  price: number;
  occupancy: string;
  contact: string;
  facilities: Facilities;
  photos: string;
  isActive: boolean
  inactiveReason: string
  bookingType: string
};

interface HostelData {
  _id: string;
  hostelname: string;
  location: string;
  bedShareRoom: string;
  phone: string;
  facilities: Facilities;
  photos: string[];
  beds: string;
  isActive: boolean;
  inactiveReason: string;
  bookingType: string
};

type HostelCardProps = {
  hostel: Hostel;
  onDelete: (hostel: Hostel) => Promise<void>;
};

type FacilityBadgeProps = {
  icon: React.ReactNode;
  label: string;
  available: boolean;
  color: 'green' | 'blue' | 'purple';
};

// EmptyState Component
const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] p-8">
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

      <div className="text-center max-w-md mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-fade-in">
          No Hostels Found
        </h3>
        <p className="text-gray-600 leading-relaxed">
          We couldn't find any hostels at the moment. Don't worry - new listings are added frequently.
          Try refreshing or head back to explore other options.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/host/home')}
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
const HostelCard: React.FC<HostelCardProps> = ({ hostel, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/host/detailhostel?id=${hostel.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/host/edit-hostel/${hostel.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(hostel); // Pass the entire hostel object
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
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
            title="Edit hostel"
          >
            <Edit size={16} className="text-blue-600" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            title="Delete hostel"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>

          <button
            onClick={handleLikeClick}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
            title="Add to favorites"
          >
            <Heart
              size={16}
              className={`${isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
            />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ₹{hostel.price}/month
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{hostel.name}</h3>
          {hostel.rating && (
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-600">
                {hostel.rating} ({hostel.reviews || 0})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin size={16} className="mr-1" />
          <span>{hostel.address}</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-start gap-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${hostel.isActive
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
              {hostel.isActive ? '✓ Available' : '✗ Unavailable'}
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${hostel.bookingType === 'one month'
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
              : 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
              }`}>
              <div className="flex items-center gap-1">
                {hostel.bookingType === 'one month' ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Monthly
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Daily
                  </>
                )}
              </div>
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
            <span>{hostel.occupancy} per room</span>
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

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
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


const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, totalResults, isSearching }) => {
  return (
    <div className="mb-4 flex justify-end">
      <div className="relative w-80">
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

const HostelCardGrid: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [totalHostels, setTotalHostels] = useState<number>(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hostelToDelete, setHostelToDelete] = useState<string | null>(null);
  const [hostelNameToDelete, setHostelNameToDelete] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);


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


  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' },
    { value: 'name_a_z', label: 'Name: A to Z' },
    { value: 'name_z_a', label: 'Name: Z to A' },
  ];

  const [sortOption, setSortOption] = useState<string>('default');

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    setCurrentPage(1);
    console.log(searchTerm, 'lsdfsdf')
    fetchHostels(1, ITEMS_PER_PAGE, searchTerm, newSort);
  };

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    if (debouncedSearchTerm.length === 0 || debouncedSearchTerm.length >= 2) {
      setCurrentPage(1);
      fetchHostels(1, ITEMS_PER_PAGE, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleDeleteClick = async (hostel: Hostel) => {
    setHostelToDelete(hostel.id);
    setHostelNameToDelete(hostel.name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hostelToDelete) {
      try {
        await handleDeleteHostel(hostelToDelete);
        handleCloseModal();
      } catch (error) {
        console.error('Error deleting hostel:', error);
        handleCloseModal();
      }
    }
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setHostelToDelete(null);
    setHostelNameToDelete('');
  };



  const handleSearchChange = (value: string) => {
    console.log("fldfsdf")
    setSearchTerm(value);

    setCurrentPage(1);
  };


  const fetchHostels = async (page: number = 1, limit: number = ITEMS_PER_PAGE, search: string = '', sort?: string) => {
    try {
      console.log('1')
      setIsLoading(true);
      setIsSearching(search.length > 0);

      const skip = (page - 1) * limit;

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());
      params.append('page', page.toString());

      if (search && search.length >= 2) {
        params.append('search', search);
      }

      if (sort && sort !== 'default') {
        params.append('sort', sort);
      }

      const response = await getAllHostels(params);
      const data = response.data.message;
      console.log(data.hostels, 'API Response');
      setTotalHostels(data.totalCount)
      const hostels = data.hostels.map((item: HostelData) => {

        const facilitiesObj = {
          wifi: !!item.facilities.wifi,
          food: !!item.facilities.food,
          laundry: !!item.facilities.laundry,
        };

        return {
          id: item._id,
          name: item.hostelname,
          address: item.location,
          price: item.bedShareRoom,
          contact: item.phone,
          facilities: facilitiesObj,
          photos: item.photos[0] || '',
          occupancy: item.beds,
          isActive: item.isActive,
          inactiveReason: item.inactiveReason,
          bookingType: item.bookingType
        };
      });

      setHostels(hostels);

      setTotalCount(data.totalCount || 0);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / limit));
    } catch (error) {
      console.error('Error fetching hostels:', error);
      setHostels([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleDeleteHostel = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await deleteHostel(id);
      if (response.data.message === 'Hostel updated successfully' || response.status === 200) {
        const remainingItemsOnCurrentPage = hostels.length - 1;
        let pageToFetch = currentPage;
        if (remainingItemsOnCurrentPage === 0 && currentPage > 1) {
          pageToFetch = currentPage - 1;
        }
        await fetchHostels(pageToFetch, ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error deleting hostel:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchHostels(1, ITEMS_PER_PAGE);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchHostels(page, ITEMS_PER_PAGE, debouncedSearchTerm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 pt-20">
      <div className="container mx-auto px-4 max-w-[75%]">
        {!isLoading && totalCount > 0 && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} hostels
            </p>
          </div>
        )}

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalResults={totalCount}
          isSearching={isSearching}
        />

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : hostels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostels.map((hostel, index) => (
                <HostelCard
                  key={`${hostel.id}-${index}`}
                  hostel={hostel}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Hostel"
        message="Are you sure you want to delete this hostel? This action cannot be undone."
        itemName={hostelNameToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default HostelCardGrid;