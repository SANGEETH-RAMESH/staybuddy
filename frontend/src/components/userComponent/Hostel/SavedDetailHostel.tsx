// import React from 'react';
import {
    Wifi,
    UtensilsCrossed,
    Phone,
    MapPin,
    Mail,
    // Home,
    User,
    CreditCard,
    XCircle,
    Star,
    AlertCircle,
    CheckCircle,
    //   Bed,
    Tag
} from 'lucide-react';
import { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
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




const SavedDetailHostel = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState<hostelData | null>(null);
    const [isEndingBooking, setIsEndingBooking] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [bookingEnded, setBookingEnded] = useState(false);
    const [existingReview, setExistingReview] = useState<{ ratings: number; review: string } | null>(null);

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                const response = await apiClient.get(`${LOCALHOST_URL}/order/getOrderDetails/${id}`);
                const orderData = response.data.message;
                console.log(orderData,'heelo')
                setOrderId(orderData._id);
                setBooking(orderData);
                setBookingEnded(!orderData.active);

                // Fetch review data
                const o_id = orderData._id;
                console.log(o_id,'he')
                const reviewData = await apiClient.get(`${LOCALHOST_URL}/order/getReviewDetailsByOrderId/${o_id}`);
                console.log(reviewData,'hee')
                if (reviewData.data.message) {
                    setExistingReview({
                        ratings: reviewData.data.message.rating,
                        review: reviewData.data.message.review
                    });
                }
            console.log(existingReview,'review')

            } catch (error) {
                console.log(error);
            }
        };
        fetchHostelDetails();
    }, []);

    const handleEndBooking = async () => {
        setShowAlert(true); 
    };


    const confirmEndBooking = async () => {
        setShowAlert(false); 
        setIsEndingBooking(true);
        try {
            const response = await apiClient.post(`${LOCALHOST_URL}/order/endBooking/${orderId}`);
            if(response.data.message == 'Updated'){
                setBookingEnded(true);
                // setShowReviewModal(true);
            }
            console.log("Eres",response)
            // alert('Booking ended successfully');
        } catch (error) {
            console.error('Error ending booking:', error);
            alert('Failed to end booking. Please try again.');
        } finally {
            setIsEndingBooking(false);
            setShowAlert(false); 
        }
    };

    const cancelEndBooking = () => {
        setShowAlert(false); 
    };


    const handleSubmitReview = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        console.log(rating,"rating")
        console.log(review,'heeee')
        setIsSubmittingReview(true);
        try {
            const response = await apiClient.post(`${LOCALHOST_URL}/order/submitReview`, {
                orderId,
                rating,
                review,
                hostelId: booking?.hostel_id.id._id
            });
            console.log(response.data.message.message)
            if(response.data.message == 'Review Created'){
                toast.success("Review Added")
            }
            setShowReviewModal(false);
            // alert('Thank you for your review!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };




    const renderActionButton = () => {
        if (existingReview?.ratings!==undefined && existingReview.review!==undefined) {
            return (
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                className={star <= existingReview.ratings ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">"{existingReview.review}"</p>
                </div>
            );
        }

        if (bookingEnded) {
            return (
                <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    <Star size={20} />
                    Write a Review
                </button>
            );
        }

        return (
            <button
                onClick={handleEndBooking}
                disabled={isEndingBooking}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
                <XCircle size={20} />
                {isEndingBooking ? 'Ending Booking...' : 'End Booking'}
            </button>
        );
    };





    // const hostelData = {
    //     name: "Sunshine Hostel",
    //     category: "Student",
    //     email: "sunshine@example.com",
    //     customerName: "John Doe",
    //     foodRate: 150,
    //     paymentMethod: "Credit Card",
    //     bed: "Single",
    //     facilities: {
    //         wifi: true,
    //         laundry: true,
    //         food: true
    //     },
    //     preferred: "Male",
    //     depositAmount: 5000,
    //     rentAmount: 3500,
    //     location: "123 College Street, City",
    //     hostMobile: "+1234567890",
    //     nearbyaccess: "Near Metro Station, Shopping Mall",
    //     image: "/api/placeholder/400/200"
    // };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header with End Booking Button */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{booking?.hostel_id.id.hostelName}</h1>
                        <div className="mt-2 inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {booking?.hostel_id.id.category}
                        </div>
                    </div>
                    {renderActionButton()}
                </div>

                {/* Review Modal */}
                {showReviewModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
                            
                            {/* Star Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            size={24}
                                            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Review Text */}
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Write your review here..."
                                className="w-full p-2 border rounded-lg mb-4 h-32 resize-none"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for Confirmation Alert */}
                {showAlert && (
                    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
                            <AlertCircle className="mx-auto text-yellow-500" size={48} />
                            <h3 className="font-semibold text-lg mt-4">Are you sure?</h3>
                            <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
                            <div className="mt-4 flex justify-center gap-4">
                                <button
                                    onClick={confirmEndBooking}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Yes, End Booking
                                </button>
                                <button
                                    onClick={cancelEndBooking}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <XCircle size={20} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex gap-4">
                    {booking?.selectedFacilities?.wifi &&
                        <div className="flex flex-col items-center">
                            <Wifi className="text-blue-500" />
                            <span className="text-xs mt-1">WiFi</span>
                        </div>
                    }
                    {booking?.selectedFacilities?.food &&
                        <div className="flex flex-col items-center">
                            <UtensilsCrossed className="text-green-500" />
                            <span className="text-xs mt-1">Food</span>
                        </div>
                    }
                    {booking?.selectedFacilities?.laundry &&
                        <div className="flex flex-col items-center">
                            <UtensilsCrossed className="text-green-500" />
                            <span className="text-xs mt-1">Food</span>
                        </div>
                    }
                </div>
            </div>

            {/* Main Image */}
            <div className="w-full h-48 rounded-lg overflow-hidden mb-6">
                <img
                    src={booking?.hostel_id.id.photos[0]}
                    alt={booking?.hostel_id.id.hostelName}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="text-gray-600" size={20} />
                            <h3 className="font-semibold text-lg">Customer Information</h3>
                        </div>
                        <div className="space-y-2 pl-7">
                            <p className="text-gray-600">Name: {booking?.customerName}</p>
                            <p className="text-gray-600">Preferred: {booking?.tenantPreferred}</p>
                            <p className="text-gray-600">Bed Type: {booking?.selectedBeds}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="text-gray-600" size={20} />
                            <h3 className="font-semibold text-lg">Payment Details</h3>
                        </div>
                        <div className="space-y-2 pl-7">
                            <p className="text-gray-600">Rent Amount: ₹{booking?.totalRentAmount}</p>
                            <p className="text-gray-600">Deposit: ₹{booking?.totalDepositAmount}</p>
                            <p className="text-gray-600">Payment Method: {booking?.paymentMethod}</p>
                            {booking?.foodRate && (
                                <p className="text-gray-600">Food Rate: ₹{booking?.foodRate}/month</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Phone className="text-gray-600" size={20} />
                            <h3 className="font-semibold text-lg">Contact Information</h3>
                        </div>
                        <div className="space-y-2 pl-7">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={16} />
                                <p>{booking?.hostel_id.host_mobile}</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail size={16} />
                                <p>{booking?.host_id?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="text-gray-600" size={20} />
                            <h3 className="font-semibold text-lg">Location Details</h3>
                        </div>
                        <div className="space-y-2 pl-7">
                            <p className="text-gray-600">{booking?.hostel_id?.location}</p>
                            <p className="text-sm text-gray-500">Nearby: {booking?.hostel_id?.id.nearbyaccess}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="text-gray-600" size={20} />
                            <h3 className="font-semibold text-lg">Facilities</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-7">
                            {Object.entries(booking?.selectedFacilities || {}).map(([facility, available]) => (
                                available && (
                                    <span key={facility} className="bg-white px-3 py-1 rounded-full text-sm border">
                                        {facility.charAt(0).toUpperCase() + facility.slice(1)}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedDetailHostel;