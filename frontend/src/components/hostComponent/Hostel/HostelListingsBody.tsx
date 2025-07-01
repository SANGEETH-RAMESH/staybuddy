import React, { useEffect, useState } from 'react';
import { Search, ArrowLeft, RefreshCw, Wifi, UtensilsCrossed, Shirt, MapPin, Star, Users, Phone, Heart, Home, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
import { useNavigate } from 'react-router-dom';
import createApiClient from '../../../services/apiClient';
const hostApiClient = createApiClient('host');

// Constants
const ITEMS_PER_PAGE = 6; // Adjust as needed

// Type definitions
type Facilities = {
  wifi: boolean;
  food: boolean;
  laundry: boolean;
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type Hostel = {
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
};

type HostelData = {
  _id: string;
  hostelname: string;
  location: string;
  bedShareRoom: string;
  phone: string;
  facilities: string;
  photos: string[];
  beds: string;
};

type HostelCardProps = {
  hostel: Hostel;
  onDelete: (id: string) => Promise<void>;
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this hostel?')) {
      await onDelete(id);
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
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
            title="Edit hostel"
          >
            <Edit size={16} className="text-blue-600" />
          </button>

          <button
            onClick={(e) => handleDelete(e, hostel.id)}
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

const HostelCardGrid: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchHostels = async (page: number = 1, limit: number = ITEMS_PER_PAGE) => {
    try {
      setIsLoading(true);
      const skip = (page - 1) * limit;

      const response = await hostApiClient.get(`${apiUrl}/hostel/hostels`, {
        params: {
          limit,
          skip,
          page
        }
      });

      console.log(response.data.message, 'response');

      const data = response.data.message;

      console.log(data, 'data')
      console.log(page)
      console.log(Math.ceil((data.totalCount || 0) / limit), 'hey')

      const hostels = data.hostels.map((item: HostelData) => {
        let facilitiesArray: string[] = [];
        if (Array.isArray(item.facilities) && item.facilities.length === 1) {
          facilitiesArray = item.facilities[0].split(',').map((facility: string) => facility.trim().toLowerCase());
        } else if (typeof item.facilities === 'string') {
          facilitiesArray = item.facilities.split(',').map((facility: string) => facility.trim().toLowerCase());
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
    }
  };

  const handleDeleteHostel = async (id: string) => {
    try {
      console.log('Deleting hostel with id:', id);
      const response = await hostApiClient.delete(`${apiUrl}/hostel/hostel/${id}`);
      console.log("Delete response:", response);
      
      if (response.data.message === 'Hostel updated successfully' || response.status === 200) {
     
        const remainingItemsOnCurrentPage = hostels.length - 1;
        let pageToFetch = currentPage;
        
        if (remainingItemsOnCurrentPage === 0 && currentPage > 1) {
          pageToFetch = currentPage - 1;
        }
        
        // Refetch hostels with current pagination settings
        await fetchHostels(pageToFetch, ITEMS_PER_PAGE);
        
        console.log('Hostel deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting hostel:', error);
      // You can add error notification here
    }
  };

  useEffect(() => {
    fetchHostels(1, ITEMS_PER_PAGE);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchHostels(page, ITEMS_PER_PAGE);
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
                  onDelete={handleDeleteHostel}
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
    </div>
  );
};

export default HostelCardGrid;