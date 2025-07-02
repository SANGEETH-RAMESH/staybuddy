import mongoose from "mongoose";
import createApiClient from "../services/apiClient";
const userApiClient = createApiClient('user');
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;

interface BookingDetails {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  selectedBeds: number; 
  totalRentAmount: number;
  totalDepositAmount: number;
  tenantPreferred: string;
  selectedFacilities: {
    [key: string]: boolean;
    food?: boolean;
  };
  host_id: string;
  hostel_id?: string;
  foodRate: number | null;
  category: string;
  paymentMethod: string;
}

export const getAllHosts = () => userApiClient.get(`${apiUrl}/user/allHosts`, {
        headers: { Authorization: `Bearer` },
      });

export const getChat = (id:mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/chat/getChat`, {
          params: { id },
          headers: { Authorization: `Bearer` },
        });

export const createChat = (id:mongoose.Types.ObjectId | string) => userApiClient.post(`${apiUrl}/chat/createchat`, {
        ownerId: id
      }, {
        headers: { Authorization: `Bearer` }
      });
      

export const getSingleHostel = (id:mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/hostel/getsingleHostel/${id}`);

export const getUserDetails = () => userApiClient.get(`${apiUrl}/user/getUserDetails`);

export const getWalletDetails = () => userApiClient.get(`${apiUrl}/wallet/getWalletDetails`)

export const orderDetails = (bookingDetails:BookingDetails) => userApiClient.post(`${apiUrl}/order/bookings`, bookingDetails)


export const payment  = (totalAmount:number) => userApiClient.post('/order/payment', {
        totalAmount: totalAmount * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {},
      });

export const checkWishlists = (hostelId:mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/wishlist/checkWishlist/${hostelId}`)

export const addToWishlist = (id:mongoose.Types.ObjectId | string) => userApiClient.post(`${apiUrl}/wishlist/addToWishlist/${id}`);

export const deleteWishlist = (id:mongoose.Types.ObjectId | string) => userApiClient.delete(`${apiUrl}/wishlist/removeFromWishlist/${id}`);

export const getHostels = (params:URLSearchParams) => userApiClient.get(`${apiUrl}/hostel/getHostels?${params.toString()}`);

export const getSavedBookings = (id:mongoose.Types.ObjectId | string,params:URLSearchParams) => userApiClient.get(`${apiUrl}/order/getSavedBookings/${id}?${params}`);

export const getOrderDetails = (id:mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/order/getOrderDetails/${id}`); 

export const getReviewByOrderId = (o_id:mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/order/getReviewDetailsByOrderId/${o_id}`);

export const endBooking = (orderId:mongoose.Types.ObjectId | string) => userApiClient.post(`${apiUrl}/order/endBooking/${orderId}`)

export const submitReview = (orderId:mongoose.Types.ObjectId | string,
    rating:number,
    review:string,
    hostelId:mongoose.Types.ObjectId | string
) =>  userApiClient.post(`${apiUrl}/order/submitReview`, {
                orderId,
                rating,
                review,
                hostelId
            });

export const getHostel = () => userApiClient.get(`${apiUrl}/user/getHostels`);

export const changePassword = (formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) => userApiClient.patch(`${apiUrl}/user/changepassword`, formData);

export const editProfile = (formData: { name: string; mobile: string }) => userApiClient.patch(`${apiUrl}/user/editprofile`, formData);

export const getReviewDetails = (id:mongoose.Types.ObjectId | string) => userApiClient.get(`${apiUrl}/order/getReviewDetails/${id}`);

export const deposit = (amount:number) =>  userApiClient.post(`${apiUrl}/wallet/deposit`, { amount });

export const withdrew = (amount:number) => userApiClient.post(`${apiUrl}/wallet/withdraw`, { amount });

export const getWishlist = () => userApiClient.get(`${apiUrl}/wishlist/getWishlist`);

export const removeFromWishlist = (hostel_id:mongoose.Types.ObjectId | string) => userApiClient.delete(`${apiUrl}/wishlist/removeFromWishlist/${hostel_id}`);

export const deleteWishlists = () => userApiClient.delete(`${apiUrl}/wishlist/deleteWishlist`);