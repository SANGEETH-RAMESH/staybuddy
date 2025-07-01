import React, { useState } from 'react';
import {
    Wifi,
    UtensilsCrossed,
    Phone,
    MapPin,
    Mail,
    User,
    CreditCard,
    XCircle,
    Star,
    AlertCircle,
    CheckCircle,
    Calendar,
    Shield,
    Car,
    Bed,
} from 'lucide-react';
import { useEffect } from 'react';
import createApiClient from '../../../services/apiClient';
const userApiClient = createApiClient('user');
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


interface HosetlNestedData {
    advanceAmount: number;
    bedShareRoom: number;
    beds: number;
    category: string;
    facilities: string[];
    foodRate: number;
    host_id: string;
    hostelName: string;
    location: string;
    nearbyaccess: string;
    phone: string;
    photos: string[];
    policies: string;
    _id: string
}

interface Hostel {
    id: HosetlNestedData;
    name: string;
    location: string;
    host_mobile: string;
}

interface Facilities {
    wifi: boolean;
    laundry: boolean;
    food: boolean;
    [key: string]: boolean;
}

interface Host {
    _id: string;
    name: string;
    email: string;
    password: string;
    mobile: number;
}

interface hostelData {
    category: string;
    createdAt: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    foodRate: number | null;
    host_id: Host;
    hostel_id: Hostel;
    paymentMethod: string;
    selectedBeds: number;
    selectedFacilities: Facilities;
    tenantPreferred: string;
    totalDepositAmount: number;
    totalRentAmount: number;
    updatedAt: string;
    userId: string;
    _id: string
}

interface Review {
    ratings: number;
    review: string;
}



const SavedDetailHostel = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isEndingBooking, setIsEndingBooking] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [bookingEnded, setBookingEnded] = useState(false);
    const [existingReview, setExistingReview] = useState<Review | null>(null);

    const { id } = useParams();
    const [booking, setBooking] = useState<hostelData | null>(null);
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                console.log("id", id)
                const response = await userApiClient.get(`${apiUrl}/order/getOrderDetails/${id}`);
                const orderData = response.data.message;
                console.log(orderData, 'heelo')
                setOrderId(orderData._id);
                setBooking(orderData);
                setBookingEnded(!orderData.active);
                // setLoading(false)
                // Fetch review data
                const o_id = orderData._id;
                console.log(o_id, 'he')
                const reviewData = await userApiClient.get(`${apiUrl}/order/getReviewDetailsByOrderId/${o_id}`);
                console.log(reviewData.data.message, 'hee')
                setLoading(false)

                if (reviewData.data.message) {
                    setExistingReview({
                        ratings: reviewData.data.message.rating,
                        review: reviewData.data.message.review
                    });
                }
                console.log(existingReview, 'review')

            } catch (error) {
                console.log(error);
            }
        };
        fetchHostelDetails();
    }, []);

    const handleEndBooking = () => setShowAlert(true);
    const confirmEndBooking = async () => {
        setShowAlert(false);
        setIsEndingBooking(true);
        try {
            const response = await userApiClient.post(`${apiUrl}/order/endBooking/${orderId}`);
            if (response.data.message == 'Updated') {
                setBookingEnded(true);
                // setShowReviewModal(true);
            }
            console.log("Eres", response)
            setLoading(false)
            // alert('Booking ended successfully');
        } catch (error) {
            console.error('Error ending booking:', error);
            alert('Failed to end booking. Please try again.');
        } finally {
            setIsEndingBooking(false);
            setShowAlert(false);
        }
    };
    const cancelEndBooking = () => setShowAlert(false);

    const handleSubmitReview = async () => {
        const invalidChars = /[*%$#@!^&+=]/;

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!review.trim()) {
            toast.error('Review cannot be empty');
            return;
        }

        if (invalidChars.test(review)) {
            toast.error('Review contains invalid characters like *, %, $, etc.');
            return;
        }

        setIsSubmittingReview(true);

        try {
            const response = await userApiClient.post(`${apiUrl}/order/submitReview`, {
                orderId,
                rating,
                review,
                hostelId: booking?.hostel_id.id._id
            });
            console.log(response.data.message, 'Sangggg')
            if (response.data.message === 'Review Created') {
                toast.success('Review Added');
                setExistingReview({
                    ratings: rating,
                    review: review
                });

            }

            setShowReviewModal(false);
            setLoading(false);

        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="relative w-16 h-16">
                    {/* Outer circle */}
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    {/* Spinning arc */}
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }


    const facilities = [
        { key: 'wifi', icon: Wifi, label: 'High-Speed WiFi', color: 'text-blue-500' },
        { key: 'food', icon: UtensilsCrossed, label: 'Meals Included', color: 'text-green-500' },
        { key: 'laundry', icon: Shield, label: 'Laundry Service', color: 'text-purple-500' },
        { key: 'parking', icon: Car, label: 'Parking', color: 'text-orange-500' },
        { key: 'security', icon: Shield, label: '24/7 Security', color: 'text-red-500' }
    ];

    const renderActionButton = () => {
        if (existingReview) {
            return (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Your Review</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={16}
                                    className={star <= existingReview.ratings ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{existingReview.review}"</p>
                </div>
            );
        }

        if (bookingEnded) {
            return (
                <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-2">
                        <Star size={20} />
                        Write a Review
                    </div>
                </button>
            );
        }

        return (
            <button
                onClick={handleEndBooking}
                disabled={isEndingBooking}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-2">
                    <XCircle size={20} />
                    {isEndingBooking ? 'Ending Booking...' : 'End Booking'}
                </div>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft size={20} />
                            </button> */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                                <p className="text-sm text-gray-500">Manage your hostel booking</p>
                            </div>
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Heart size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Share2 size={20} className="text-gray-600" />
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Hostel Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    {/* Image Gallery */}
                    <div className="relative h-80 bg-gray-200">
                        <img
                            src={booking?.hostel_id.id.photos[0]}
                            alt={booking?.hostel_id.id.hostelName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 flex gap-2">

                        </div>
                        <div className="absolute top-4 right-4">
                            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {booking?.hostel_id.id.category}
                            </span>
                        </div>
                    </div>

                    {/* Hostel Info */}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {booking?.hostel_id.id.hostelName}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                    <MapPin size={16} />
                                    <span className="text-sm">{booking?.hostel_id.location}</span>
                                </div>
                                {booking?.createdAt && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Calendar size={16} />
                                        <span>Booked since {new Date(booking.createdAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                            {renderActionButton()}
                        </div>

                        {/* Facilities */}
                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Available Facilities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {facilities.map(({ key, icon: Icon, label, color }) => (
                                    booking?.selectedFacilities[key] && (
                                        <div key={key} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <Icon className={`${color} mb-2`} size={24} />
                                            <span className="text-xs text-center font-medium text-gray-700">{label}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="text-blue-600" size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">Customer Information</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name</span>
                                    <span className="font-medium">{booking?.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phone</span>
                                    <span className="font-medium">{booking?.customerPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email</span>
                                    <span className="font-medium">{booking?.customerEmail}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Preference</span>
                                    <span className="font-medium">{booking?.tenantPreferred}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Beds</span>
                                    <span className="font-medium flex items-center gap-1">
                                        <Bed size={16} />
                                        {booking?.selectedBeds}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CreditCard className="text-green-600" size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">Payment Details</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Monthly Rent</span>
                                    <span className="font-bold text-green-600">₹{booking?.totalRentAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Security Deposit</span>
                                    <span className="font-bold text-blue-600">₹{booking?.totalDepositAmount.toLocaleString()}</span>
                                </div>
                                {booking?.foodRate && <div className="flex justify-between">
                                    <span className="text-gray-600">Food Charges</span>
                                    <span className="font-bold text-orange-600">₹{booking?.foodRate?.toLocaleString()}/month</span>
                                </div>}

                                <div className="flex justify-between pt-3 border-t">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm">
                                        {booking?.paymentMethod}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Host Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Phone className="text-purple-600" size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">Host Contact</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {booking?.host_id.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{booking?.host_id.name}</p>
                                        <p className="text-sm text-gray-500">Host</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone size={16} />
                                    <span>{booking?.hostel_id.host_mobile}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail size={16} />
                                    <span>{booking?.host_id.email}</span>
                                </div>
                                {/* <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2">
                                    <MessageCircle size={16} />
                                    Contact Host
                                </button> */}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <MapPin className="text-red-600" size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">Location & Access</h3>
                            </div>
                            <div className="space-y-3">
                                <p className="text-gray-700">{booking?.hostel_id.location}</p>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium mb-1">Nearby Access:</p>
                                    <p className="text-sm text-gray-700">{booking?.hostel_id.id.nearbyaccess}</p>
                                </div>
                                {/* <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-medium transition-colors">
                                    View on Map
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showReviewModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                            <h3 className="font-bold text-xl mb-6 text-center">Write a Review</h3>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transform hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            size={32}
                                            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                        />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Share your experience with other guests..."
                                className="w-full p-4 border border-gray-200 rounded-xl mb-6 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview || rating === 0 || !review.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAlert && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-yellow-600" size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-2">End Booking?</h3>
                            <p className="text-gray-600 mb-6">This action cannot be undone. Your booking will be terminated immediately.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelEndBooking}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmEndBooking}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Yes, End Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedDetailHostel;