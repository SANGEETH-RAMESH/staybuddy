import mongoose, { Types } from "mongoose";
import { IHost } from "../../model/hostModel";
import { IHostel } from "../../model/hostelModel";
import { IReview } from "../../model/reviewModel";
import { IOrder } from "../../model/orderModel";
import { IUserResponse } from "../../dtos/UserResponse";
import { IHostResponse } from "../../dtos/HostResponse";
import { IUpdateHostelInput } from "../../dtos/HostelData";
import { IOrderResponse } from "../../dtos/OrderResponse";
import { reviewData } from "../../dtos/ReviewData";

export interface IAdminService {
    adminLogin(adminData: { email: string, password: string }): Promise<{
        message: string;
        accessToken?: string;
        refreshToken?: string;
        role?: string
    }>,
    getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null>,
    userBlock(userId: Types.ObjectId): Promise<string>,
    userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUserResponse | null; error?: string }>,
    userDelete(userId: object): Promise<string>,
    getHost(skip: number, limit: number): Promise<{ hosts: IHostResponse[] | null; totalCount: number, hostIdCounts: Record<string, number> } | null>,
    hostUnBlock(hostId: Types.ObjectId): Promise<string>,
    hostBlock(hostId: Types.ObjectId): Promise<string>,
    hostDelete(hostId: Types.ObjectId): Promise<string>,
    approveHost(hostId: mongoose.Types.ObjectId): Promise<string>,
    rejectHost(hostId: mongoose.Types.ObjectId): Promise<string>,
    getAllHostels(page: string, limit: string): Promise<{ hostels: IUpdateHostelInput[], totalCount: number; } | string | null>,
    getHostDetails(userId: string): Promise<string | IHostResponse | null>,
    getHostHostelData(hostId: string): Promise<IUpdateHostelInput[] | string | null>,
    deleteHostel(hostelId: string): Promise<string>,
    searchUser(name: string): Promise<IUserResponse[] | string>,
    searchHost(name: string): Promise<IHostResponse[] | string | null>,
    searchHostel(name: string): Promise<IUpdateHostelInput[] | string | null>,
    getReviews(hostelId: string): Promise<reviewData[] | string | null>,
    getSales(): Promise<IOrderResponse[] | string | null>,
    validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string>
}