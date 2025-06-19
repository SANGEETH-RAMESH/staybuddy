import mongoose, { Types } from "mongoose";
import { IHost } from "../../model/hostModel";
import { IUser } from "../../model/userModel";
import {ObjectId} from 'mongoose'
import { IHostel } from "../../model/hostelModel";
import { ICategory } from "../../model/categoryModel";
import { IReview } from "../../model/reviewModel";
import { IOrder } from "../../model/orderModel";

export interface IAdminService{
    adminLogin(adminData: { email: string,password: string }): Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    getUser(page: number, limit: number): Promise<{ users: IUser[]; totalCount: number } | string | null>,
    userBlock(userId:ObjectId):Promise<string>,
    userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUser | null; error?: string }>,
    userDelete(userId:object):Promise<string>,
    getHost(skip:number,limit:number): Promise<{ hosts: IHost[] | null;totalCount: number, hostIdCounts: Record<string, number> } | null>,
    hostUnBlock(hostId:ObjectId):Promise<string>,
    hostBlock(hostId:ObjectId):Promise<string>,
    hostDelete(hostId:Types.ObjectId):Promise<string>,
    approveHost(hostId: mongoose.Types.ObjectId):Promise<string>,
    rejectHost(hostId:mongoose.Types.ObjectId):Promise<string>,
    getAllHostels(page: string, limit: string): Promise<{ hostels: IHostel[], totalCount: number; } | string | null>,
    addCategory(name:string,isActive:boolean,photo:string | undefined):Promise<string>,
    getAllCategory(skip:number,limit:number):Promise<{getCategories:ICategory[],totalCount:number} | string>,
    getCategory(id:string):Promise<ICategory | string>,
    updateCategory(id: string, name: string, isActive: boolean): Promise<string>,
    getUserDetails(userId:string):Promise<string | IHost | null>,
    getHostHostelData(hostId:string): Promise<IHostel[] | string | null>,
    deleteHostel(hostelId: string): Promise<string>,
    deleteCategory(id: string): Promise<string | null>,
    searchCategory(name:string):Promise<ICategory[] | string | null>,
    searchUser(name: string): Promise<IUser[] | string>,
    searchHost(name: string): Promise<IHost[] | string | null>,
    searchHostel(name: string): Promise<IHostel[] | string | null>,
    getReviews(hostelId: string): Promise<IReview[] | string | null>,
    getSales():Promise<IOrder[]| string | null>,
    validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string>
}