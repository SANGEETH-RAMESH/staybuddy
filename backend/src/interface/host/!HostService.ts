import { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import Host, { IHost } from "../../model/hostModel";
import { ICategory } from "../../model/categoryModel";
import { IWallet } from "../../model/walletModel";
import { IOrder } from "../../model/orderModel";
import { IUser } from "../../model/userModel";
import { IUpdateHostelInput } from "../../dtos/HostelData";

// Host data structure
interface IHostData {
    email: string;
    name: string;
    mobile: string;
    password: string;
}

// OTP data structure
interface IHostOtp {
    email: string;
    otp: number;
}

interface hostData {
    name: string,
    mobile: number,
    email: string,
    password: string
}


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

interface HostData{
    name?:string,
    email?:string
}

type HostType = InstanceType<typeof Host>;

export interface IHostService {
    SignUp(hostData: hostData): Promise<string>;
    verifyOtp(hostOtp: IHostOtp): Promise<string>;
    forgotPassword(hostData: IHostData): Promise<HostType | null>;
    resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }>;
    resendOtp(hostData: hostData): Promise<string | null>;
    verifyLogin(hostData: { email: string, password: string }): Promise<{ message: string, accessToken?: string, refreshToken?: string }>;
    newHost(host_id: Types.ObjectId): Promise<string>,
    approvalRequest(host_id:Types.ObjectId,photo:string | undefined,documentType:string):Promise<string>,
    hostGoogleSignUp(hostData:HostData):Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    getHost(id:Types.ObjectId):Promise<IHost | string>,
    validateRefreshToken(refreshToken:string):Promise<{  accessToken: string; refreshToken: string } | string>,
    getAllCategory(): Promise<ICategory[] | string>,
    changePassword(hostData: { hostId: Types.ObjectId; currentPassword: string; newPassword: string }): Promise<string>,
    editProfile(hostData: { hostId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    getAllUsers(): Promise<IUser[] | string | null>,
    getAdmin(): Promise<IUser | string | null>,
}
