import axios from "axios";
import createApiClient from "../apis/apiClient";
const hostApiClient = createApiClient('host');
const apiUrl = import.meta.env.VITE_BACKEND_URL;
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

export const getwalletDetails = () => hostApiClient.get(`${apiUrl}/wallet/`);

export const payment  = (amount:string) => hostApiClient.post('/wallet/payment', {totalAmount:amount });

export const deposit = (depositAmount:number) => hostApiClient.post(`${apiUrl}/wallet/deposit`, { amount: depositAmount });

export const withdrew = (amount:string) => hostApiClient.post(`${apiUrl}/wallet/withdraw`, { amount });

export const status = (data:{id:string,isActive:boolean,inactiveReason? :string}) => hostApiClient.patch(`${apiUrl}/hostel/host/status`,data);


export const signUpOtp = ({ email, otp }: { email: string; otp: number }) => axios.post(`${apiUrl}/host/verifyotp`, {
        email,
        otp
      });

export const addProperty = () => hostApiClient.get(`${apiUrl}/host/newHost`)

export const loginUrl = (formValues:{email:string,password:string}) => axios.post(`${apiUrl}/host/verifylogin`,formValues)

export const verifyForgotPasswordOtp =  ({ email, otp }: { email: string; otp: number }) => axios.post(
          `${apiUrl}/host/verifyforgotpasswordotp`,
          { email, otp }
        );

// export const resendOtp = (email:string) => axios.post(
//         "http://localhost:4000/host/resendOtp",
//         { email }
//       );

export const forgotPassword = ({ email }: { email: string }) => axios.post(`${apiUrl}/host/forgotpassword`, { email });

export const resendOtp = ({email,name,mobile,password,}: {email: string;name?: string;mobile?: string;password?: string;}) =>
  axios.post(`${apiUrl}/host/resendotp`, {
    email,
    ...(name && { name }),
    ...(mobile && { mobile }),
    ...(password && { password }),
  });

export const verifyOtp = (email:string,otp:number) => axios.post(`${apiUrl}/host/verifyotp`, {
        email,
        otp
      });

export const resetPassword = (email:string,password:string,confirmPassword:string) => axios.post(
          `${apiUrl}/host/resetPassword`,
          { email, password, confirmPassword }
        );

export const signUp = (formValues: { name: string; email: string; password: string; mobile?: string }) => axios.post(`${apiUrl}/host/signup`, formValues );

export const googleLogin = async (credential:string) =>  axios.post(`${apiUrl}/host/google/callback`,{credential});
