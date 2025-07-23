import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Wifi,
    UtensilsCrossed,
    Shirt,
    MapPin,
    Users,
    Phone,
    IndianRupee,
    Building,
    User,
    Train,
    Shield,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Star,
    MessageCircle,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { createChat, getOrderBookingByHostelId, getSingleHostel } from '../../../services/userServices';
import LocationDisplay from '../../commonComponents/LocationDisplay';
import BookingModal from '../../commonComponents/BookingModal';
import mongoose from 'mongoose';
import { Hostel } from '../../../interface/Hostel';
import { Order } from '../../../interface/Order';

interface BookingData {
    fromDate: string;
    toDate: string;
    guests: number;
}

const ImageGallery = ({ photos }: { photos: string[] | string }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const defaultImage = "/api/placeholder/800/400";
    const totalImages = photos?.length || 3;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6">
            <div className="relative">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-4 p-4">
                    <div className="relative h-[400px] xl:h-[480px] rounded-lg overflow-hidden">
                        <img
                            src={photos[0] || defaultImage}
                            alt="Main hostel view"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="grid grid-rows-2 gap-4">
                        <div className="relative rounded-lg overflow-hidden">
                            <img
                                src={photos[(currentImageIndex + 1) % totalImages] || defaultImage}
                                alt="Second hostel view"
                                className="w-full h-[190px] xl:h-[235px] object-cover"
                            />
                        </div>
                        <div className="relative rounded-lg overflow-hidden">
                            <img
                                src={photos[(currentImageIndex + 2) % totalImages] || defaultImage}
                                alt="Third hostel view"
                                className="w-full h-[190px] xl:h-[235px] object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile/Tablet Layout */}
                <div className="lg:hidden relative h-[250px] sm:h-[300px] md:h-[350px]">
                    <img
                        src={photos[currentImageIndex] || defaultImage}
                        alt={`Hostel view ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />

                    <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>

                    <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:gap-2">
                        {Array.from({ length: totalImages }).map((_, index) => (
                            <button
                                key={index}
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-3 sm:w-4' : 'bg-white/60'
                                    }`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HostelDetailPage = () => {
    const { id } = useParams();
    const [hostel, setHostel] = useState<Hostel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                if (!id) return;

                const response = await getSingleHostel(id);
                console.log(response.data.message, 'Response')
                setHostel(response.data.message);

                const orderResponse = await getOrderBookingByHostelId(new mongoose.Types.ObjectId(response.data.message._id));
                console.log(orderResponse.data.message, 'ldflsdfsdf')
                const allBookings = orderResponse?.data?.message || [];

                const hostelBookings = allBookings.filter((booking: Order) =>
                    booking.hostel_id.toString() === id
                );
                console.log(hostelBookings, 'Hostel Bookings')

                setOrderDetails(hostelBookings);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch hostel details');
                setLoading(false);
                console.error('Error fetching hostel details:', err);
            }
        };

        fetchHostelDetails();
    }, [id]);

    const handleBooking = () => {
        if (!hostel) {
            toast.error('Hostel data not available');
            return;
        }
        if (typeof hostel.totalRooms !== 'number') {
            toast.error('Room availability data missing');
            return;
        }
        console.log('Booking initiated for hostel:', hostel?.beds);
        if (hostel.beds < 0) {
            toast.error('No rooms available at the moment');
            return;
        } else if (hostel?.isActive == false) {
            toast.error('Hostel is Inactive')
        } else if (hostel) {
            console.log(hostel.totalRooms)
            setShowBookingModal(true);
        }
    };

    const handleChatWithOwner = async (ownerId: string) => {
        if (hostel?.host_id?._id) {
            console.log(ownerId, 'Owner id')
            console.log(hostel?.host_id._id, "Hosttt")
            const response = await createChat(ownerId)
            if (response.data.success) {
                console.log('Initiating chat with hostel owner:', hostel.host_id._id);
                navigate(`/chat/${hostel.host_id._id}`, {
                    state: {
                        hostName: hostel.host_id.name,
                        hostelName: hostel.hostelname,
                        hostId: hostel.host_id
                    }
                });
            }
        } else {
            console.error('Host information not available');
        }
    };

    const handleBookingConfirm = (bookingData: BookingData) => {
        setShowBookingModal(false);

        navigate(`/booking/${id}`, {
            state: {
                fromDate: bookingData.fromDate,
                toDate: bookingData.toDate,
                guests: bookingData.guests,
                hostelData: hostel
            }
        });
    };

    const handleGoBack = () =>{
        navigate('/hostel')
    }

    const navigateToRatingsAndReviews = () => {
        navigate(`/reviews/${id}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !hostel) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-lg sm:text-xl text-red-600 text-center">{error || 'Hostel not found'}</div>
            </div>
        );
    }

    const facilities: string[] = Array.isArray(hostel.facilities)
        ? hostel.facilities
        : typeof hostel.facilities === 'string'
            ? hostel.facilities.split(',').map((f: string) => f.trim())
            : [];

    return (
        <div className="bg-gray-50 min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Sticky Header */}
                <div
                    className="sticky z-50 bg-white/95 backdrop-blur-md shadow-sm mb-4 sm:mb-6 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:rounded-lg"
                    style={{ top: '60px' }}
                >
                    <div className="max-w-6xl mx-auto">

                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base font-medium">Back</span>
                        </button>
                        {/* Mobile Header */}
                        <div className="block lg:hidden">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                {hostel.hostelname}
                            </h1>
                            <div className="flex items-center text-gray-600 mb-3">
                                <MapPin className="mr-2 flex-shrink-0" size={16} />
                                <span className="text-sm">{hostel.location}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    onClick={() => handleChatWithOwner(hostel.host_id._id.toString())}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat with Owner
                                </button>
                                <button
                                    onClick={handleBooking}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Book Hostel
                                </button>
                            </div>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl xl:text-3xl font-bold text-gray-800">
                                    {hostel.hostelname}
                                </h1>
                                <div className="flex items-center text-gray-600 mt-1">
                                    <MapPin className="mr-2" size={18} />
                                    <span className="text-base">{hostel.location}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleChatWithOwner(hostel.host_id._id.toString())}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat with Owner
                                </button>
                                <button
                                    onClick={handleBooking}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Book Hostel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ImageGallery photos={hostel.photos} />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                            <Star className="text-blue-500" size={18} />
                            Basic Information
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center">
                                <Building className="mr-3 text-blue-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Category</p>
                                    <p className="font-medium text-sm sm:text-base">{hostel.category} hostel</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Users className="mr-3 text-green-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Occupancy</p>
                                    <p className="font-medium text-sm sm:text-base">{hostel.beds} per room</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <User className="mr-3 text-purple-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Host</p>
                                    <p className="font-medium text-sm sm:text-base">{hostel.host_id?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Phone className="mr-3 text-orange-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Contact</p>
                                    <p className="font-medium text-sm sm:text-base">{hostel.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                            <IndianRupee className="text-green-500" size={18} />
                            Pricing Details
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <IndianRupee className="mr-3 text-green-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Monthly Rent</p>
                                    <p className="font-medium text-sm sm:text-base">₹{hostel?.bedShareRoom?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <IndianRupee className="mr-3 text-blue-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Advance Amount</p>
                                    <p className="font-medium text-sm sm:text-base">₹{hostel?.advanceamount?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <UtensilsCrossed className="mr-3 text-orange-500 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Food Rate (Monthly)</p>
                                    <p className="font-medium text-sm sm:text-base">₹{hostel?.foodRate?.toLocaleString() || "No Food"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location & Accessibility */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Location & Accessibility</h2>
                        <div className="flex items-start p-3 sm:p-4 bg-gray-50 rounded-lg mb-3 sm:mb-4">
                            <Train className="mr-3 text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Nearby Access</p>
                                <p className="font-medium text-sm sm:text-base">{hostel.nearbyaccess}</p>
                            </div>
                        </div>

                        {hostel.latitude && hostel.longitude && (
                            <div className="overflow-hidden rounded-lg">
                                <LocationDisplay
                                    latitude={hostel.latitude}
                                    longitude={hostel.longitude}
                                    locationName={hostel.location}
                                    hostelName={hostel.hostelname}
                                />
                            </div>
                        )}
                    </div>

                    {/* Facilities */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Facilities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {facilities.map((facility, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    {facility.toLowerCase().includes('wifi') && <Wifi className="mr-2 text-blue-500 flex-shrink-0" size={16} />}
                                    {facility.toLowerCase().includes('food') && <UtensilsCrossed className="mr-2 text-green-500 flex-shrink-0" size={16} />}
                                    {facility.toLowerCase().includes('laundry') && <Shirt className="mr-2 text-purple-500 flex-shrink-0" size={16} />}
                                    <span className="capitalize text-xs sm:text-sm">{facility}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hostel Policies */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:col-span-2">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Hostel Policies</h2>
                        <div className="flex items-start p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <Shield className="mr-3 text-blue-500 flex-shrink-0 mt-1" size={18} />
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Eligibility & Rules</p>
                                <p className="font-medium text-sm sm:text-base mt-1">{hostel.policies}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:col-span-2">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Cancellation Policy</h2>
                        <div className="flex items-start p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <Shield className="mr-3 text-green-500 flex-shrink-0 mt-1" size={18} />
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Policy Type</p>
                                <p className="font-medium text-sm sm:text-base mt-1">
                                    {hostel.cancellationPolicy === 'freecancellation'
                                        ? 'Free Cancellation Policy Available'
                                        : hostel.cancellationPolicy || 'Standard Cancellation Policy'
                                    }
                                </p>
                                {hostel.cancellationPolicy === 'freecancellation' && (
                                    <p className="text-xs sm:text-sm text-green-600 mt-2">
                                        You can cancel your booking without any charges
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:col-span-2">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reviews</h2>
                        <button
                            onClick={navigateToRatingsAndReviews}
                            className="w-full sm:w-auto py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-sm"
                        >
                            Show Reviews and Ratings
                        </button>
                    </div>
                </div>
            </div>

            {showBookingModal && (
                <BookingModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    onConfirm={handleBookingConfirm}
                    hostelName={hostel.hostelname}
                    maxGuests={Number(hostel.beds) || 10}
                    orderDetails={orderDetails}
                    totalRooms={hostel.totalRooms || 10}
                />
            )}
        </div>
    );
};

export default HostelDetailPage;