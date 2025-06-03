import {
  Building2,
  MapPin,
  Clock,
  ArrowUpRight,
  CalendarCheck,
  Bed,
  UserCheck,
  PhoneCall,
  Mail,
  CreditCard,
  Filter
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LOCALHOST_URL } from '../../../constants/constants';
import { useNavigate, useParams } from 'react-router-dom';
import hostapiClient from '../../../services/hostapiClient';

// Interface definitions
interface HostelData {
  advanceAmount: number;
  bedShareRoom: number;
  beds: number;
  category: string;
  facilities: string[];
  foodRate: number;
  host_id: string;
  hostelName: string;
  location: string;
  nearbyAccess: string;
  phone: string;
  photos: string[];
  policies: string;
  _id: string;
}

interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  selectedBeds: number;
  tenantPreferred: string;
  totalDepositAmount: number;
  totalRentAmount: number;
  foodRate: number | null;
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
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHostBookings = async () => {
      setIsLoading(true);
      try {
        console.log(id)
        const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getBookings/${id}`);
        console.log(response.data.message,'hdfsd')
        const bookingsData = response.data.message;
        
        // // Adding mock status since it wasn't in your original model
        // const bookingsWithStatus = bookingsData.map((booking: any) => ({
        //   ...booking,
        //   status: Math.random() > 0.7 ? 'Pending' : Math.random() > 0.5 ? 'Confirmed' : 'Cancelled'
        // }));
        setBookings(bookingsData)
        // setBookings(bookingsWithStatus);
        // setFilteredBookings(bookingsWithStatus);
        // console.log("Fetched bookings:", bookingsWithStatus);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHostBookings();
  }, [id]);

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
    
    if (filterValue === 'all') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking => 
        booking.status.toLowerCase() === filterValue.toLowerCase()
      );
      setFilteredBookings(filtered);
    }
  };

  const navigateToBookingDetails = (bookingId: string) => {
    navigate(`/host/booking-details/${bookingId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
            <span>Total Bookings: {bookings.length}</span>
          </div>
          
          <div className="relative flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 text-blue-600" />
            <select
              className="bg-transparent border-none focus:outline-none pr-6"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">No bookings found with the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={booking?.hostel_id.id.photos[0] || "/placeholder-hostel.jpg"}
                  alt={booking?.hostel_id.id.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">{booking.hostel_id.id.hostelname}</h2>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.hostel_id.id.location}</span>
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
                  <button
                    onClick={() => navigateToBookingDetails(booking._id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span className="text-sm">Manage</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostBookings;