// import React from 'react';
import {
    Building2,
    MapPin,
    Clock,
    ArrowUpRight,
    CalendarCheck,
    Bed,
    UserCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { useNavigate, useParams } from 'react-router-dom';


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
    nearbyAccess: string;
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
}

interface hostelData {
    category: string;
    createdAt: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    foodRate: number | null;
    host_id: string;
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

const SavedBookings = () => {
    const [booking, setBooking] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchSavedBookings = async () => {
            try {
                const response = await apiClient.get(`${LOCALHOST_URL}/user/getSavedBookings/${id}`);
                const hostelData = response.data.message;

                console.log(hostelData, "Fetched Data");
                console.log(booking, 'sdfsdf')
                setBooking(hostelData);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };
        fetchSavedBookings();
    }, [id]);


    // const navigateToDetailHostel = (id: string) => {
    //     navigate(`/user/detailbookings/${id}`)
    // }




    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Booked Hostels</h1>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Recent Bookings</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {booking.map((hostel: hostelData) => (
                    <div
                        key={hostel._id}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="relative">
                            <img
                                src={hostel.hostel_id.id.photos[0] || "fallback-image-url.jpg"}
                                alt={hostel.hostel_id.name}
                                className="w-full h-48 object-cover"
                            />
                            {/* <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${hostel.status === 'Confirmed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {hostel.status}
                                </span>
                            </div> */}
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">{hostel.hostel_id.name}</h2>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">{hostel.hostel_id.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <CalendarCheck className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">Booked Date</span>
                                    </div>
                                    <span className="font-medium">
                                        {new Date(hostel.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <UserCheck className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">For</span>
                                    </div>
                                    <span className="font-medium">{hostel.tenantPreferred}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <Bed className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">Beds</span>
                                    </div>
                                    <span className="font-medium">{hostel.selectedBeds} Bed(s)</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div>
                                    <p className="text-xs text-gray-500">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-800">{hostel.totalDepositAmount + hostel.totalRentAmount + (hostel.foodRate ? hostel.foodRate : 0)}</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/user/detailbookings/${hostel._id}`)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <span className="text-sm">Details</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedBookings;