import mongoose, { Types } from "mongoose";
import { IHost } from "../../model/hostModel";
import { IUser } from "../../model/userModel";
import {ObjectId} from 'mongoose'
import { IHostel } from "../../model/hostelModel";
import { ICategory } from "../../model/categoryModel";

export interface IAdminService{
    adminLogin(adminData:{admin_email:string,admin_password:string}):Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    getUser():Promise<IUser[] | null>,
    userBlock(userId:ObjectId):Promise<string>,
    userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUser | null; error?: string }>,
    userDelete(userId:object):Promise<string>,
    getHost():Promise<{ hosts: IHost[] | null; hostIdCounts: Record<string, number> } | null>,
    hostUnBlock(hostId:ObjectId):Promise<string>,
    hostBlock(hostId:ObjectId):Promise<string>,
    hostDelete(hostId:Types.ObjectId):Promise<string>,
    approveHost(hostId: mongoose.Types.ObjectId):Promise<string>,
    rejectHost(hostId:mongoose.Types.ObjectId):Promise<string>,
    getAllHostels():Promise<IHostel [] | null | string>,
    addCategory(name:string,isActive:boolean,photo:string | undefined):Promise<string>,
    getAllCategory():Promise<ICategory[] | string>,
    getCategory(id:string):Promise<ICategory | string>,
    updateCategory(id: string, name: string, isActive: boolean): Promise<string>,
    getUserDetails(userId:string):Promise<string | IHost | null>,
    getHostHostelData(hostId:string): Promise<IHostel[] | string | null>
    
}