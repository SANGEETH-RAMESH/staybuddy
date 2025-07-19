import createApiClient from "../apis/apiClient";
const hostApiClient = createApiClient('host');
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
import mongoose from "mongoose";
// import hostapiClient from "../apis/hostapiClient";

export const submitHostApproval = (formData: FormData) =>
    hostApiClient.post(`${apiUrl}/host/approval`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });


export const getAdmin = () => hostApiClient.get(`${apiUrl}/host/getAdmin`)

export const getHost = () => hostApiClient.get(`${apiUrl}/host/getHost`);

export const getChat = (Id: string) => hostApiClient.post(`${apiUrl}/chat/hostChat`, {
    userId: Id
}, {
    headers: { Authorization: `Bearer` }
});

export const getHostChat = () => hostApiClient.get(`${apiUrl}/chat/getHostChat`);

export const getAllUsers = () => hostApiClient.get(`${apiUrl}/host/allUsers`);

export const getAllCategory = () => hostApiClient.get(`${apiUrl}/host/getAllCategory`);

export const addHostel = (dataToSend: FormData) => hostApiClient.post(`${apiUrl}/hostel/host`, dataToSend, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const editHostel = (id: string | mongoose.Types.ObjectId, dataToSend: FormData) => hostApiClient.put(`${apiUrl}/hostel/host/${id}`, dataToSend, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const getSingleHostel = (id: string | mongoose.Types.ObjectId) => hostApiClient.get(`${apiUrl}/hostel/host/detail?id=${id}`);

export const getAllHostels = (params:URLSearchParams) => hostApiClient.get(`${apiUrl}/hostel/host/hostels`, {params});

export const deleteHostel = (id: string | mongoose.Types.ObjectId) => hostApiClient.delete(`${apiUrl}/hostel/host/${id}`);

export const getBookings = (id: string | mongoose.Types.ObjectId, params: URLSearchParams) => hostApiClient.get(`${apiUrl}/order/hosts/${id}/bookings?${params}`);

export const changePassword = (formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) => hostApiClient.patch(`${apiUrl}/host/changepassword`, { formData });

export const editProfile = (data: { name: string; mobile: string }) => hostApiClient.patch(`${apiUrl}/host/editprofile`, data);

export const getwalletDetails = () => hostApiClient.get(`${apiUrl}/wallet/getWalletDetails`);

export const payment  = (amount:string) => hostApiClient.post('/order/payments', {
        totalAmount: parseFloat(amount) * 100, 
        currency: 'INR',
        receipt: 'receipt#1',
        notes: {},
      });

export const deposit = (depositAmount:number) => hostApiClient.post(`${apiUrl}/wallet/deposit`, { amount: depositAmount });

export const withdrew = (amount:string) => hostApiClient.post(`${apiUrl}/wallet/withdraw`, { amount });

export const status = (data:{id:string,isActive:boolean,inactiveReason? :string}) => hostApiClient.patch(`${apiUrl}/hostel/host/status`,data);