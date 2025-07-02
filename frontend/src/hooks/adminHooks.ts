import mongoose from "mongoose";
import createApiClient from "../services/apiClient";
const AdminApiClient = createApiClient('admin');
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;

export const getUserDetails = (id: string) => AdminApiClient.get(`${apiUrl}/admin/getHostDetails/${id}`);

export const getHostHostelData = (id: string) => AdminApiClient.get(`${apiUrl}/admin/getHostHostelData/${id}`);

export const getSales = () => AdminApiClient.get(`${apiUrl}/admin/sales`);

export const getUser = () => AdminApiClient.get(`${apiUrl}/admin/getUser`);

export const getHostel = (page: number, itemsPerPage: number) => AdminApiClient.get(`${apiUrl}/admin/getHostel`, {
    params: { page, limit: itemsPerPage },
});


export const getReviews = (hostelId: string) => AdminApiClient.get(`${apiUrl}/admin/reviews/${hostelId}`);

export const searchHostel = (searchTerm: string) => AdminApiClient.get(
    `${apiUrl}/admin/searchhostel?name=${searchTerm}`
);

export const deleteHostel = (hostelToDelete: string) => AdminApiClient.delete(`${apiUrl}/admin/hostel`, {
    params: { hostel_id: hostelToDelete }
});


export const approveHost = (finalHostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/approvehost`, { hostId: finalHostId });

export const rejectHost = (finalHostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/rejecthost`, { hostId: finalHostId })

export const deleteHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.delete<{ success: boolean }>(
    `${apiUrl}/admin/deletehost/${hostId}`
);

export const blockHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/hostblock`, { hostId });

export const unblockHost = (hostId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/hostunblock`, { hostId });

export const searchHost = (newSearchTerm: string) => AdminApiClient.get(
    `${apiUrl}/admin/searchhost?name=${newSearchTerm}`
);

export const fetchHost = (skip: number, limit: number) => AdminApiClient.get(
    `${apiUrl}/admin/getHosts?skip=${skip}&limit=${limit}`
);


export const blockUser = (userId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/userblock`, { userId });

export const unblockUser = (userId: string | mongoose.Types.ObjectId) => AdminApiClient.patch(`${apiUrl}/admin/userunblock`, { userId });


export const deleteUser = (userId: string | mongoose.Types.ObjectId) => AdminApiClient.delete('http://localhost:4000/admin/deleteuser', {
    data: { userId },
});

export const fetchUser = (page:number,limit:number) =>  AdminApiClient.get(
        `http://localhost:4000/admin/getUser?page=${page}&limit=${limit}`
      );

export const searchUser = (newSearchTerm: string,itemsPerPage:number) =>  AdminApiClient.get(
          `${apiUrl}/admin/searchuser?name=${newSearchTerm}&page=1&limit=${itemsPerPage}`
        );
