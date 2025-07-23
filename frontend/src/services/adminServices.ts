import mongoose from "mongoose";
import createApiClient from "../apis/apiClient";
const AdminApiClient = createApiClient('admin');
const apiUrl = import.meta.env.VITE_BACKEND_URL;

export const getUserDetails = (id: string) => AdminApiClient.get(`${apiUrl}/admin/hosts/${id}`);

export const getHostHostelData = (id: string) => AdminApiClient.get(`${apiUrl}/admin/hosts/${id}/hostels`);

export const getSales = () => AdminApiClient.get(`${apiUrl}/admin/sales`);

export const getAllUser = () => AdminApiClient.get(`${apiUrl}/admin/getUser?page=1&&llimit=`);

export const getUser = () => AdminApiClient.get(`${apiUrl}/admin/users?page=1&limit=4`);


export const getHostel = (page: number, itemsPerPage: number) => AdminApiClient.get(`${apiUrl}/admin/hostels`, {
    params: { page, limit: itemsPerPage },
});


export const getReviews = (hostelId: string) => AdminApiClient.get(`${apiUrl}/admin/reviews/${hostelId}`);

export const searchHostel = (searchTerm: string) => AdminApiClient.get(
    `${apiUrl}/admin/hostels/search?name=${searchTerm}`
);

export const deleteHostel = (hostelId: string) => AdminApiClient.delete(`${apiUrl}/admin/hostels/${hostelId}`);


export const approveHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/hosts/${hostId}/approve`);

export const rejectHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/hosts/${hostId}/reject`)

export const deleteHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.delete<{ success: boolean }>(
    `${apiUrl}/admin/hosts/${hostId}`
);

export const blockHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/hosts/${hostId}/block`);

export const unblockHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/hosts/${hostId}/unblock`);

export const searchHost = (newSearchTerm: string) => AdminApiClient.get(
    `${apiUrl}/admin/searchhost?name=${newSearchTerm}`
);

export const fetchHost = (skip: number, limit: number) => AdminApiClient.get(
    `${apiUrl}/admin/hosts?skip=${skip}&limit=${limit}`
);


export const blockUser = (userId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/users/${userId}/block`);

export const unblockUser = (userId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/users/${userId}/unblock`);


export const deleteUser = (userId: string | mongoose.Types.ObjectId) => AdminApiClient.delete(`${apiUrl}/admin/users/${userId}`);

export const fetchUser = (page:number,limit:number) =>  AdminApiClient.get(
        `http://localhost:4000/admin/users?page=${page}&limit=${limit}`
      );

export const searchUser = (newSearchTerm: string,itemsPerPage:number) =>  AdminApiClient.get(
          `${apiUrl}/admin/users/search?name=${newSearchTerm}&page=1&limit=${itemsPerPage}`
        );
