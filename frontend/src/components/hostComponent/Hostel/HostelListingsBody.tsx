import React, { useEffect, useState } from 'react';
import {  Search, ArrowLeft, RefreshCw ,Wifi, UtensilsCrossed, Shirt, MapPin, Star, Users, Phone, Heart, Home } from 'lucide-react';
import { LOCALHOST_URL } from '../../../constants/constants';
import hostapiClient from '../../../services/hostapiClient';
import { useNavigate } from 'react-router-dom';


// Type definitions
type Facilities = {
  wifi: boolean;
  food: boolean;
  laundry: boolean;
};

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
const HostelCard: React.FC<HostelCardProps> = ({ hostel }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/host/detailhostel?id=${hostel.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
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
          onClick={handleLikeClick}
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

// Main HostelCardGrid Component
const HostelCardGrid: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getHostels`);
        const datas = response.data.message;

        const hostels = datas.map((item: HostelData) => {
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
      } catch (error) {
        console.error('Error fetching hostels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 pt-20">
      <div className="container mx-auto px-4 max-w-[75%]">
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          View Perfect Hostel
        </h1> */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : hostels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel, index) => (
              <HostelCard key={`${hostel.id}-${index}`} hostel={hostel} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default HostelCardGrid;