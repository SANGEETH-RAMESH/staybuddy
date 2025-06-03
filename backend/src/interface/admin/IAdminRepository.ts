import mongoose from "mongoose";
import { IHost } from "../../model/hostModel";
import { IUser } from "../../model/userModel";
import { ObjectId, Types } from 'mongoose'
import { IHostel } from "../../model/hostelModel";
import { ICategory } from "../../model/categoryModel";

export interface IAdminRepository {
    FindAdminByEmail(email: string): Promise<IUser | null>,
    AdminVerifyLogin(adminData: { admin_email: string, admin_password: string }): Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    getUser(): Promise<IUser[] | null>,
    userBlock(userId: ObjectId): Promise<string>,
    userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUser | null; error?: string }>,
    userDelete(userId: Types.ObjectId): Promise<string>,
    getHost(): Promise<IHost[] | null>,
    hostUnBlock(hostId: ObjectId): Promise<string>,
    hostBlock(hostId: ObjectId): Promise<string>,
    hostDelete(hostId: Types.ObjectId): Promise<string>,
    approveHost(hostId: mongoose.Types.ObjectId): Promise<string>,
    findHostById(id: mongoose.Types.ObjectId): Promise<IHost | null | string>,
    rejectHost(hostId: mongoose.Types.ObjectId): Promise<string>,
    getAllHostels(page: string, limit: string): Promise<{ hostels: IHostel[], totalCount: number; } | string | null>,
    addCategory(name: string, isActive: boolean, photo: string | undefined): Promise<string>,
    getAllCategory(skip:number,limit:number): Promise<{getCategories:ICategory[],totalCount:number} | string>,
    findCategoryByName(name:string):Promise<string>,
    getCategory(id:string):Promise<ICategory | string>,
    updateCategory(id: string, name: string, isActive: boolean): Promise<string>,
    getUserDetails(userId:string):Promise<string | IHost | null>,
    getHostHostelData(hostId:string): Promise<IHostel[] | string | null>,
    getHostels(): Promise<IHostel[] | string | null>,
    deleteHostel(hostelId: string): Promise<string>,
    deleteCategory(id: string): Promise<string | null>,
    searchCategory(name:string):Promise<ICategory[] | string | null>
}