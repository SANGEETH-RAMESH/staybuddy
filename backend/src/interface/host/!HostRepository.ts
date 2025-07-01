import { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import { IHost } from "../../model/hostModel";
import { ICategory } from "../../model/categoryModel";
import { IOrder } from "../../model/orderModel";
import { IWallet } from "../../model/walletModel";
import { IUser } from "../../model/userModel";
import { IUpdateHostelInput } from "../../dtos/HostelData";


interface HostelData {
    name: string,
    location: string,
    nearbyAccess: string,
    bedsPerRoom: number,
    policies: string,
    category: string,
    advance: number,
    facilities: string[],
    bedShareRate: number,
    foodRate: number,
    phoneNumber: string,
    photo: string[]
}
// interface IHostData {
//     name: string;
//     mobile: string;
//     email: string;
//     password: string;
// }

interface hostData{
    name:string,
    mobile:number,
    email:string,
    password:string
}

interface HostData{
    name:string,
    mobile:string,
    email:string,
    password:string
}



export interface IHostRepository {
    FindHostByEmail(email: string): Promise<IHost | null>,
    OtpGenerating(email: string, otp: number): Promise<void>,
    tempStoreHost(hostData:hostData):Promise<void>,
    otpChecking(hostData: { email: string; otp: number }): Promise<string>,
    CreateHost(hostData: {email:string}): Promise<string>,
    resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }>;
    verifyLogin(hostData: {email:string,password:string}): Promise<{ message: string; accessToken?: string; refreshToken?: string }>;
    newHost({ hostels, host_id, }: { hostels: IHostel[]; host_id: Types.ObjectId; }): Promise<string>,
    approvalRequest(host_id:Types.ObjectId):Promise<string>,
    addGoogleHost(hostData:HostData):Promise<{ message: string, host?: IHost }| string>,
    getAllHostels(): Promise<IHostel[] | string>,
    findHostById(id:Types.ObjectId):Promise<IHost | string>,
    getAllCategory(): Promise<ICategory[] | string>,
    uploadDocument(host_id:Types.ObjectId,photo:string | undefined,documentType:string):Promise<string>,
    findHostWallet(id:string):Promise<IWallet | string | null>,
    changePassword(hostData: { hostId: Types.ObjectId; currentPassword: string; newPassword: string }): Promise<string>,
    editProfile(hostData: { hostId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    getAllUsers(): Promise<IUser[] | string | null>,
    getAdmin(): Promise<IUser | string | null>,
    getHost(skip: number, limit: number): Promise<{ hosts: IHost[]; totalCount: number } | null>,
    allHost(): Promise<IHost[] | string | null>
}