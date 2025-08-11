import mongoose from "mongoose";
import { IHost } from "../../model/hostModel";
import { IUser } from "../../model/userModel";
import { ObjectId, Types } from 'mongoose'
import { IHostel } from "../../model/hostelModel";
import { ICategory } from "../../model/categoryModel";
import { IReview } from "../../model/reviewModel";
import { IOrder } from "../../model/orderModel";
import { IUserResponse } from "../../dtos/UserResponse";
import { IHostResponse } from "../../dtos/HostResponse";
import { reviewData } from "../../dtos/ReviewData";

export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<IUserResponse | null>,
    findAdminById(id: Types.ObjectId): Promise<IUserResponse | null | string>,
    adminVerifyLogin(email: string,): Promise<IUserResponse | string>,
    getReviews(hostelId: string): Promise<reviewData[] | string | null>,
    getAdmin(): Promise<IUser | string | null>
}