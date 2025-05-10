import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Star, 
  MapPin, 
  User, 
  Building, 
  Eye, 
  X,
  Loader,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { LOCALHOST_URL } from '../../../constants/constants';

type Review = {
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Hostel = {
  id: string;
  hostName: string;
  hostelName: string;
  location: string;
  image: string;
  averageRating: number;
  reviews: Review[];
};

type Host = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isBlock: boolean;
  approvalRequest: string;
  tempExpires: string;
};

type HostelData = {
  _id: string;
  hostelname: string;
  location: string;
  nearbyaccess: string;
  beds: number;
  policies: string;
  category: string;
  advanceamount: number;
  photos: string[];
  facilities: string[];
  bedShareRoom: number;
  foodRate: number;
  phone: string;
  host_id: Host; // Populated host details
  reviews: Review[];
};

const HostelListings = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${LOCALHOST_URL}/admin/getHostel`);
        console.log(response.data.message, 'response');

        const data: Hostel[] = response.data.message.map((item: HostelData) => ({
          id: item._id,
          hostName: item.host_id.name,
          hostelName: item.hostelname,
          location: item.location,
          image: item.photos[0] || "",
          averageRating: !item.reviews ? 0 : item.reviews.reduce((acc, review) => acc + review.rating, 0) / (item.reviews.length || 1),
          reviews: item.reviews || [],
        }));

        setHostels(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE)); 
        setIsLoading(false)
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // Calculate the hostels to display on the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHostels = hostels.slice(startIndex, endIndex);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hostel?')) {
      try {
        setHostels(hostels.filter(hostel => hostel.id !== id));
      } catch (error) {
        console.error('Error deleting hostel:', error);
      }
    }
  };

  const ReviewsModal = ({ hostel }: { hostel: Hostel | null }) => {
    if (!hostel) return null;

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showReviews ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">Reviews for {hostel.hostelName}</h3>
            <button onClick={() => setShowReviews(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {hostel.reviews?.length > 0 ? (
              hostel.reviews.map((review, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">{review.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No reviews yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    // Simplified wrapper with consistent padding
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Properties</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-12 h-12 text-[#45B8F2] animate-spin" />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedHostels.length > 0 ? (
              paginatedHostels.map((hostel) => (
                <div key={hostel.id} className="bg-[#212936] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                  <div className="relative h-48">
                    <img
                      src={hostel.image || "/api/placeholder/400/300"}
                      alt={hostel.hostelName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedHostel(hostel);
                          setShowReviews(true);
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(hostel.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[#45B8F2] mb-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{hostel.hostName}</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-300" />
                        <h3 className="font-semibold text-white">{hostel.hostelName}</h3>
                      </div>
                      {hostel.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-[#45B8F2]/10 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-[#45B8F2]" />
                          <span className="text-[#45B8F2] font-medium">
                            {hostel.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{hostel.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-400">
                No hostel listings found
              </div>
            )}
          </div>

          {paginatedHostels.length > 0 && (
            <div className="mt-8 flex justify-center gap-4 items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <span className="text-white font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      <ReviewsModal hostel={selectedHostel} />
    </div>
  );
};

export default HostelListings;