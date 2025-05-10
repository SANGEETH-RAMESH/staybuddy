import React, { useEffect, useState } from 'react';
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
    MessageCircle
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';

interface Host {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    isBlock: boolean;
    approvalRequest: string;
    tempExpires: string;
}

interface HostelDetail {
    _id: string;
    advanceamount: number;
    bedShareRoom: number;
    beds: number;
    category: string;
    facilities: string[] | string;
    foodRate: number;
    host_id: Host;
    hostelname: string;
    location: string;
    nearbyaccess: string;
    phone: string;
    photos: string[];
    policies: string;
}

const ImageGallery = ({ photos }: { photos: string[] }) => {
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative">
                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-2 gap-4 p-4">
                    <div className="relative h-[480px] rounded-lg overflow-hidden">
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
                                className="w-full h-[235px] object-cover"
                            />
                        </div>
                        <div className="relative rounded-lg overflow-hidden">
                            <img
                                src={photos[(currentImageIndex + 2) % totalImages] || defaultImage}
                                alt="Third hostel view"
                                className="w-full h-[235px] object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden relative h-[400px]">
                    <img
                        src={photos[currentImageIndex] || defaultImage}
                        alt={`Hostel view ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {Array.from({ length: totalImages }).map((_, index) => (
                            <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-4' : 'bg-white/60'
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
    const [hostel, setHostel] = useState<HostelDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                const response = await apiClient.get(`${LOCALHOST_URL}/user/getsingleHostel/${id}`);
                setHostel(response.data.message);
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
        console.log('Booking initiated for hostel:', id);
        navigate(`/user/booking/${id}`)
    };

    const handleChatWithOwner = async(ownerId:string) => {
        if (hostel?.host_id?._id) {
            console.log(ownerId,'Owner id')
            console.log(hostel?.host_id._id,"Hosttt")
            const response = await apiClient.post(`${LOCALHOST_URL}/chat/createchat`, { ownerId })
            if(response.data.success){
                console.log('Initiating chat with hostel owner:', hostel.host_id._id);
                navigate(`/user/chat/${hostel.host_id._id}`, {
                    state: {
                        hostName: hostel.host_id.name,
                        hostelName: hostel.hostelname,
                        hostId:hostel.host_id
                    }
                });
            }
            
        } else {
            console.error('Host information not available');
        }
    };

    const navigateToRatingsAndReviews = () => {
        navigate(`/user/reviews/${id}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error || !hostel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">{error || 'Hostel not found'}</div>
            </div>
        );
    }

    const facilities = Array.isArray(hostel.facilities)
        ? hostel.facilities
        : typeof hostel.facilities === 'string'
            ? hostel.facilities.split(',').map(f => f.trim())
            : [];

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Sticky Header with Book Now and Chat Buttons */}
                <div
                    className="sticky z-50 bg-white/80 backdrop-blur-md shadow-sm mb-6 -mx-4 px-4 py-4 md:rounded-lg"
                    style={{ top: '64px' }}
                >
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                {hostel.hostelname}
                            </h1>
                            <div className="flex items-center text-gray-600 mt-1">
                                <MapPin className="mr-2" size={18} />
                                <span className="text-sm md:text-base">{hostel.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                 onClick={() => handleChatWithOwner(hostel.host_id._id)}
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

                <ImageGallery photos={hostel.photos} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Star className="text-blue-500" size={20} />
                            Basic Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Building className="mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{hostel.category} hostel</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Users className="mr-3 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Occupancy</p>
                                    <p className="font-medium">{hostel.beds} per room</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <User className="mr-3 text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Host</p>
                                    <p className="font-medium">{hostel.host_id?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Phone className="mr-3 text-orange-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="font-medium">{hostel.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <IndianRupee className="text-green-500" size={20} />
                            Pricing Details
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <IndianRupee className="mr-3 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Monthly Rent</p>
                                    <p className="font-medium">₹{hostel?.bedShareRoom?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <IndianRupee className="mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Advance Amount</p>
                                    <p className="font-medium">₹{hostel?.advanceamount?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <UtensilsCrossed className="mr-3 text-orange-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Food Rate (Monthly)</p>
                                    <p className="font-medium">₹{hostel?.foodRate?.toLocaleString() || "No Food"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Facilities */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Facilities</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {facilities.map((facility, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    {facility.toLowerCase().includes('wifi') && <Wifi className="mr-2 text-blue-500" />}
                                    {facility.toLowerCase().includes('food') && <UtensilsCrossed className="mr-2 text-green-500" />}
                                    {facility.toLowerCase().includes('laundry') && <Shirt className="mr-2 text-purple-500" />}
                                    <span className="capitalize text-sm">{facility}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location & Access */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Location & Accessibility</h2>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Train className="mr-3 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Nearby Access</p>
                                <p className="font-medium">{hostel.nearbyaccess}</p>
                            </div>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Hostel Policies</h2>
                        <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                            <Shield className="mr-3 text-blue-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Eligibility & Rules</p>
                                <p className="font-medium mt-1">{hostel.policies}</p>
                            </div>
                        </div>
                    </div>

                    {/* Review */}
                    <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                        <button
                            onClick={navigateToRatingsAndReviews}
                            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Show Reviews and Ratings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostelDetailPage;