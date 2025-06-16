import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Search
} from 'lucide-react';
import { LOCALHOST_URL } from '../../../constants/constants';
import { toast } from 'react-toastify';
import { Review } from '../../../types/Review';
import { Hostel } from '../../../types/Hostel';
import { HostelData } from '../../../types/Order';
import adminApiClient from '../../../services/adminApiClient';

// type Review = {
//   userId: string;
//   rating: number;
//   comment: string;
//   createdAt: string;
// };

// type Hostel = {
//   id: string;
//   hostName: string;
//   hostelName: string;
//   location: string;
//   image: string;
//   averageRating: number;
//   reviews: Review[];
// };

// type Host = {
//   _id: string;
//   name: string;
//   email: string;
//   mobile: string;
//   isBlock: boolean;
//   approvalRequest: string;
//   tempExpires: string;
// };

// type HostelData = {
//   _id: string;
//   hostelname: string;
//   location: string;
//   nearbyaccess: string;
//   beds: number;
//   policies: string;
//   category: string;
//   advanceamount: number;
//   photos: string[];
//   facilities: string[];
//   bedShareRoom: number;
//   foodRate: number;
//   phone: string;
//   host_id: Host; // Populated host details
//   reviews: Review[];
// };

const HostelListings = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [hostelReviews, setHostelReviews] = useState<Review[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hostelToDelete, setHostelToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchHostels(currentPage);
  }, [currentPage]);

  const fetchHostels = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await adminApiClient.get(`${LOCALHOST_URL}/admin/getHostel`, {
        params: { page, limit: itemsPerPage },
      });
      console.log(response.data.message, 'response');
      const totalCount = response.data.message.totalCount
      setTotalItems(totalCount)
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      setTotalPages(totalPages)
      const data: Hostel[] = response.data.message.hostels.map((item: HostelData) => {
        return {
          id: item._id,
          hostName: item.host_id?.name,
          hostelName: item?.hostelname,
          location: item?.location,
          image: item?.photos[0] || "",
          averageRating: !item?.reviews
            ? 0
            : item?.reviews?.reduce((acc, review) => acc + review.rating, 0) / (item.reviews.length || 1),
          reviews: item?.reviews || [],
        };
      });

      setHostels(data);
      setTotalItems(response.data.message.totalCount || data.length);
      // setTotalPages(Math.ceil((response.data.message.totalCount || data.length) / itemsPerPage));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // New function to fetch reviews for a specific hostel
  const fetchHostelReviews = async (hostelId: string) => {
    try {
      setIsLoadingReviews(true);
      const response = await adminApiClient.get(`${LOCALHOST_URL}/admin/reviews/${hostelId}`);
      console.log("Response", response.data.message)
      const reviews = response.data.message;
      const result = reviews.map((review: Review) => ({
        userId: review.userId,
        hostelId: review.hostelId,
        rating: review.rating,
        review: review.review, 
        createdAt: review.createdAt
      }));
      setHostelReviews(result)
      setIsLoadingReviews(false);
    } catch (error) {
      console.error('Error fetching hostel reviews:', error);
      toast.error('Failed to fetch reviews');
      setHostelReviews([]);
      setIsLoadingReviews(false);
    }
  };

  // Updated function to handle eye button click
  const handleViewReviews = async (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setShowReviews(true);
    await fetchHostelReviews(hostel.id);
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const search = e.target.value;
      setSearchTerm(search)

      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(async () => {
        console.log(search, 'hee')
        if (search.trim() === '') {
          console.log('hey')
          fetchHostels(1);
          return;
        }

        try {
          const response = await adminApiClient.get(
            `${LOCALHOST_URL}/admin/searchhostel?name=${searchTerm}`
          );
          console.log("Response", response.data.message);
          const searchResults = response.data.message;
          const data: Hostel[] = searchResults.map((item: HostelData) => {
            return {
              id: item._id,
              hostName: item.host_id?.name,
              hostelName: item?.hostelname,
              location: item?.location,
              image: item?.photos[0] || "",
              averageRating: !item?.reviews
                ? 0
                : item?.reviews?.reduce((acc, review) => acc + review.rating, 0) / (item.reviews.length || 1),
              reviews: item?.reviews || [],
            };
          });
          setHostels(data);
          // Reset pagination info for search results
          // setpag({
          //   currentPage: 1,
          //   totalPages: 1,
          //   totalHosts: searchResults.length,
          //   hasNext: false,
          //   hasPrev: false
          // });
          setTotalPages(1)
          setCurrentPage(1);
        } catch (error) {
          console.log("Search error", error);
        }
      }, 500);
    } catch (error) {
      console.log(error)
    }
  }

  const confirmDelete = (id: string) => {
    setHostelToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (hostelToDelete) {
      try {

        setShowDeleteModal(false)

        console.log("heeyy")
        console.log(hostelToDelete, 'delete')
        const response = await adminApiClient.delete(`${LOCALHOST_URL}/admin/hostel`, {
          params: { hostel_id: hostelToDelete }
        });
        console.log(response, "reponse")
        if (response.data.message == 'Hostel Deleted') {
          toast.success("Hostel Deleted")
          setTimeout(() => {
            setHostels(hostels.filter(hostel => hostel.id !== hostelToDelete));
          }, 1000);
        }

        // Close the modal
        // setShowDeleteModal(false);
        setHostelToDelete(null);

        // Refetch the current page if we deleted the last item on a page
        if (hostels.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchHostels(currentPage);
        }
      } catch (error) {
        console.error('Error deleting hostel:', error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
          <p className="mb-6">Are you sure you want to delete this hostel? This action cannot be undone.</p>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };


  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      if (currentPage > 2 && currentPage < totalPages - 1) {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      } else if (currentPage <= 3) {
        pages.push(2, 3, 4);
      } else {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
      }

      if (currentPage < totalPages - 2) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  // Updated ReviewsModal to use fetched reviews and show loading state
  const ReviewsModal = ({ hostel }: { hostel: Hostel | null }) => {
    if (!hostel) return null;

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showReviews ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">Reviews for {hostel.hostelName}</h3>
            <button
              onClick={() => {
                setShowReviews(false);
                setHostelReviews([]);
                setSelectedHostel(null);
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {isLoadingReviews ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="w-8 h-8 text-[#45B8F2] animate-spin" />
                <span className="ml-2 text-gray-600">Loading reviews...</span>
              </div>
            ) : hostelReviews.length > 0 ? (
              hostelReviews.map((review, index) => (
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
                  <p className="text-gray-700">{review.review}</p>
                  {review.userId && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <User className="w-3 h-3" />
                      <span>User ID: {review.userId}</span>
                    </div>
                  )}
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Properties</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search hostels..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-[#1A202C] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-[#45B8F2] focus:outline-none w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-12 h-12 text-[#45B8F2] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hostels.length > 0 ? (
              hostels.map((hostel) => (
                <div key={hostel.id} className="bg-[#212936] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                  <div className="relative h-48">
                    <img
                      src={hostel.image || "/api/placeholder/400/300"}
                      alt={hostel.hostelName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => handleViewReviews(hostel)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => confirmDelete(hostel.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Host name */}
                    <div className="flex items-center gap-2 text-[#45B8F2] mb-3">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm truncate">{hostel.hostName}</span>
                    </div>

                    {/* Hostel name and rating */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Building className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        <h3 className="font-semibold text-white text-lg leading-tight truncate">
                          {hostel.hostelName}
                        </h3>
                      </div>
                      {hostel.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-[#45B8F2]/10 px-2 py-1 rounded-full flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-[#45B8F2]" />
                          <span className="text-[#45B8F2] font-medium text-sm">
                            {hostel.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{hostel.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-gray-400">
                <div className="flex flex-col items-center gap-3">
                  <Building className="w-12 h-12 text-gray-500" />
                  <p className="text-lg font-medium">No hostel listings found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center space-x-1">
                <button
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center rounded-md p-2 transition-colors ${currentPage === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2A3441] text-[#45B8F2] hover:bg-[#3A4451] focus:outline-none focus:ring-2 focus:ring-[#45B8F2]/50'
                    }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${currentPage === page
                          ? 'bg-[#45B8F2] text-white font-medium shadow-md'
                          : 'bg-[#2A3441] text-gray-300 hover:bg-[#3A4451] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#45B8F2]/50'
                          }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="text-gray-400 px-2 py-2">
                        {page}
                      </span>
                    )
                  ))}
                </div>

                <button
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center rounded-md p-2 transition-colors ${currentPage === totalPages
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2A3441] text-[#45B8F2] hover:bg-[#3A4451] focus:outline-none focus:ring-2 focus:ring-[#45B8F2]/50'
                    }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Page info */}
              <div className="text-center text-gray-400 text-sm">
                Showing {hostels.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} properties
              </div>
            </div>
          )}

          <ReviewsModal hostel={selectedHostel} />
          <DeleteConfirmationModal />
        </>
      )}
    </div>
  );
};

export default HostelListings;