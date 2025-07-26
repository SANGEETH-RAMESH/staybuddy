import mongoose from "mongoose";
import createApiClient from "../apis/apiClient";
import axios from "axios";
const userApiClient = createApiClient('user');
const apiUrl = import.meta.env.VITE_BACKEND_URL;

interface BookingDetails {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  selectedBeds: number;
  totalRentAmount: number;
  totalDepositAmount: number;
  tenantPreferred: string;
  selectedFacilities: {
    [key: string]: boolean | undefined;
    food?: boolean;
  };
  host_id: string;
  hostel_id?: string;
  foodRate: number | null;
  category: string;
  paymentMethod: string;
  startDate: Date;
  endDate: Date;
  cancellationPolicy: string;
}



export const getUserDetails = () => userApiClient.get(`${apiUrl}/user/users`);

export const editProfile = (formData: { name: string; mobile: string }) => userApiClient.patch(`${apiUrl}/user/profile`, formData);

export const changePassword = (formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => userApiClient.patch(`${apiUrl}/user/profile/change-password`, formData);

export const addPassword = (formData:{
  password:string;
  confirmPassword:string
}) => userApiClient.patch(`${apiUrl}/user/profile/add-password`,formData)





export const getAllHosts = () => userApiClient.get(`${apiUrl}/user/hosts`, {
  headers: { Authorization: `Bearer` },
});

export const getAllHostel = () => userApiClient.get(`${apiUrl}/hostel/user`);

export const getSingleHostel = (id: mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/hostel/user/${id}`);


export const getHostels = (params?: URLSearchParams) => userApiClient.get(`${apiUrl}/hostel/user?${params?.toString()}`);

export const loginUrl = (formValues: { email: string, password: string }) => axios.post(`${apiUrl}/user/auth/login`, formValues)

export const getNearbyHostels = () => userApiClient.get(`${apiUrl}/hostel/user/all`)

export const signUpOtp = ({ email, otp }: { email: string; otp: number }) => axios.post(`${apiUrl}/user/auth/verify-otp`, {
  email,
  otp
});


export const forgotPasswordOtp = ({ email, otp }: { email: string; otp: number }) => axios.post(`${apiUrl}/user/auth/verify-forgot-otp`, {
  email,
  otp
})
export const createBooking = (bookingDetails: BookingDetails) => userApiClient.post(`${apiUrl}/order/bookings`, bookingDetails)

export const getOrderDetails = (id: mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/order/bookings/${id}`);

export const endBooking = (orderId: mongoose.Types.ObjectId | string,cancellationStatus:string) =>
  userApiClient.post(`${apiUrl}/order/bookings/${orderId}/end`,{cancellationStatus});

export const getSavedBookings = (id: mongoose.Types.ObjectId | string, params?: URLSearchParams) => userApiClient.get(`${apiUrl}/order/users/${id}/bookings?${params}`);

export const getOrderBookingByHostelId = (id: mongoose.Types.ObjectId) => userApiClient.get(`${apiUrl}/order/users/${id}/allbookings`);


export const submitReview = (orderId: mongoose.Types.ObjectId | string,
  rating: number,
  review: string,
  hostelId: mongoose.Types.ObjectId | string
) => userApiClient.post(`${apiUrl}/order/reviews`, {
  orderId,
  rating,
  review,
  hostelId
});


export const getReviewDetails = (id: mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/order/reviews/${id}`);

export const getReviewByOrderId = (o_id: mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/order/bookings/${o_id}/review`);



export const getWishlist = () => userApiClient.get(`${apiUrl}/wishlist`);

export const checkWishlists = (hostelId: mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/wishlist/${hostelId}/check`)

export const addToWishlist = (hostelId: mongoose.Types.ObjectId | string) => userApiClient.post(`${apiUrl}/wishlist/${hostelId}`);

export const removeFromWishlist = (hostelId: mongoose.Types.ObjectId | string) => userApiClient.delete(`${apiUrl}/wishlist/${hostelId}`);

export const deleteAllWishlists = () => userApiClient.delete(`${apiUrl}/wishlist`);




export const getWalletDetails = () => userApiClient.get(`${apiUrl}/wallet`)

export const deposit = (amount: number) => userApiClient.post(`${apiUrl}/wallet/deposit`, { amount });

export const withdrew = (amount: number) => userApiClient.post(`${apiUrl}/wallet/withdraw`, { amount });



export const getChat = (id: mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/chat/getChat`, {
  params: { id },
  headers: { Authorization: `Bearer` },
});

export const createChat = (id: mongoose.Types.ObjectId | string) => userApiClient.post(`${apiUrl}/chat/createchat`, {
  ownerId: id
}, {
  headers: { Authorization: `Bearer` }
});





export const payment = (totalAmount: number) => userApiClient.post(`${apiUrl}/order/payment`, {
  totalAmount: totalAmount * 100,
  currency: 'INR',
  receipt: `receipt_${Date.now()}`,
  notes: {},
});

export const forgotPassword = ({ email }: { email: string }) => axios.post(`${apiUrl}/user/auth/forgot-password`, { email });

export const resendOtp = ({ email, name, mobile, password, }: { email: string; name?: string; mobile?: string; password?: string; }) =>
  axios.post(`${apiUrl}/user/auth/resend-otp`, {
    email,
    ...(name && { name }),
    ...(mobile && { mobile }),
    ...(password && { password }),
  });

export const resetPassword = (email: string, password: string) => axios.post(
  `${apiUrl}/user/auth/reset-password`,
  { email, password }
);

export const signUp = (formValues: { name: string; email: string; password: string; mobile?: string }) => axios.post(`${apiUrl}/user/auth/signup`, formValues );

// export const deleteWishlist = (id: mongoose.Types.ObjectId | string) => userApiClient.delete(`${apiUrl}/wishlist/removeFromWishlist/${id}`);


export const googleLogin = async (credential:string) =>  axios.post(`${apiUrl}/user/google/callback`,{credential});












