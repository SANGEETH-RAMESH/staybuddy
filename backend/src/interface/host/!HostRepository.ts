import { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import { IHost } from "../../model/hostModel";
import { ICategory } from "../../model/categoryModel";
import { IOrder } from "../../model/orderModel";
import { IWallet } from "../../model/walletModel";
import { IUser } from "../../model/userModel";


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
    FindHostByEmail(email: string): Promise<IHost | null>;
    OtpGenerating(email: string, otp: number): Promise<void>;
    tempStoreHost(hostData:hostData):Promise<void>;
    otpChecking(hostData: { email: string; otp: number }): Promise<string>;
    CreateHost(hostData: {email:string}): Promise<string>;
    resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }>;
    verifyLogin(hostData: {email:string,password:string}): Promise<{ message: string; accessToken?: string; refreshToken?: string }>;
    addHostel(hostelData: HostelData): Promise<string>;
    getHostels(id:Types.ObjectId): Promise<IHostel[] | string>;
    newHost({ hostels, host_id, }: { hostels: IHostel[]; host_id: Types.ObjectId; }): Promise<string>,
    approvalRequest(host_id:Types.ObjectId):Promise<string>,
    getOneHostel(id:Types.ObjectId):Promise<IHostel | string>,
    addGoogleHost(hostData:HostData):Promise<{ message: string, host?: IHost }| string>,
    getAllHostels(): Promise<IHostel[] | string>,
    findHostById(id:Types.ObjectId):Promise<IHost | string>,
    createWallet(email:string):Promise<string>,
    getAllCategory(): Promise<ICategory[] | string>,
    uploadDocument(host_id:Types.ObjectId,photo:string | undefined,documentType:string):Promise<string>,
    findHostWallet(id:string):Promise<IWallet | string | null>,
    getBookings(hostId: string): Promise<IOrder[] | string | null>,
    changePassword(hostData: { email: string; currentPassword: string; newPassword: string }): Promise<string>,
    editProfile(hostData: { email: string, name: string, mobile: string }): Promise<string>,
    walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string>,
    walletWithDraw({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string>,
    getAllUsers(): Promise<IUser[] | string | null>,
    getAdmin(): Promise<IUser | string | null>
    
}