import {
  Building2,
  MapPin,
  Clock,
  CalendarCheck,
  Bed,
  UserCheck,
  PhoneCall,
  Mail,
  CreditCard,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { getBookings } from '../../../services/hostServices';

interface HostelData {
  advanceAmount: number;
  bedShareRoom: number;
  beds: number;
  name?: string;
  category: string;
  facilities: string[];
  foodRate: number;
  host_id: string;
  hostelname: string;
  location: string;
  nearbyAccess: string;
  phone: string;
  photos: string[];
  policies: string;
  _id: string;
}

interface PaginationData {
  bookings: Booking[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  selectedBeds: number;
  hostelname:string;
  location:string;
  tenantPreferred: string;
  totalDepositAmount: number;
  totalRentAmount: number;
  foodRate: number | null;
  photos:string[]
  paymentMethod: string;
  hostel_id: {
    id: HostelData;
    name: string;
    location: string;
    host_mobile: string;
  };
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

const HostBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [paginationData, setPaginationData] = useState<PaginationData>({
    bookings: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 3;

  useEffect(() => {
    const fetchHostBookings = async (page: number = 1) => {
      setIsLoading(true);
      try {
        if (!id) return;
        const skip = (page - 1) * limit;
        const params = new URLSearchParams({
          skip: skip.toString(),
          limit: limit.toString()
        });
        const response = await getBookings(id, params)
        console.log(response.data.message, 'hdfsd')
        const data = response.data.message;
        const totalCount = data.totalCount || 0;
        const totalPages = Math.ceil(totalCount / limit);
        setBookings(data.bookings)
        setPaginationData({
          bookings: data.bookings || [],
          totalCount,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        });
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostBookings(currentPage);
  }, [id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  const renderPagination = () => {
    if (paginationData.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!paginationData.hasPrevPage}
          className="flex items-center justify-center w-8 h-8 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {(() => {
          const buttons = [];
          for (let i = 1; i <= paginationData.totalPages; i++) {
            buttons.push(
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded ${i === currentPage
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {i}
              </button>
            );
          }
          return buttons;
        })()}


        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!paginationData.hasNextPage}
          className="flex items-center justify-center w-8 h-8 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Total Bookings: {bookings?.length}</span>
          </div>

        </div>
      </div>

      {bookings?.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">No bookings found with the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings?.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={booking?.photos[0] || "/placeholder-hostel.jpg"}
                  alt={booking?.hostelname}
                  className="w-full h-48 object-cover"
                />
                {/* <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div> */}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">{booking.hostelname}</h2>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Customer</span>
                    </div>
                    <span className="font-medium">{booking.customerName}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <PhoneCall className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Phone</span>
                    </div>
                    <span className="font-medium">{booking.customerPhone}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Email</span>
                    </div>
                    <span className="font-medium truncate max-w-32">{booking.customerEmail}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Booked On</span>
                    </div>
                    <span className="font-medium">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Beds</span>
                    </div>
                    <span className="font-medium">{booking.selectedBeds} Bed(s)</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Payment</span>
                    </div>
                    <span className="font-medium">{booking.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{booking.totalDepositAmount + booking.totalRentAmount + (booking.foodRate || 0)}
                    </p>
                  </div>
                  {/* <button
                    onClick={() => navigateToBookingDetails(booking._id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span className="text-sm">Manage</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {renderPagination()}
    </div>
  );
};

export default HostBookings;