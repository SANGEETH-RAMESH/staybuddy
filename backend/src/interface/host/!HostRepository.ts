import { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import { ICategory } from "../../model/categoryModel";
import { IUser } from "../../model/userModel";
import { IUpdateHostelInput } from "../../dtos/HostelData";
import { IHostResponse } from "../../dtos/HostResponse";
import mongoose from "mongoose";



interface hostData {
    name: string,
    mobile: number,
    email: string,
    password: string
}

interface HostData {
    name: string,
    mobile: string,
    email: string,
    password: string
}



export interface IHostRepository {
    findHostByEmail(email: string): Promise<IHostResponse | null>,
    otpGenerating(email: string, otp: number): Promise<void>,
    tempStoreHost(hostData: hostData): Promise<void>,
    otpChecking(hostData: { email: string; otp: number }): Promise<string>,
    createHost(hostData: { email: string }): Promise<string>,
    resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }>;
    verifyLogin(hostData: { email: string, password: string }): Promise<{ message: string; accessToken?: string; refreshToken?: string }>;
    newHost({ hostels, host_id, }: { hostels: IHostel[]; host_id: Types.ObjectId; }): Promise<string>,
    approvalRequest(host_id: Types.ObjectId): Promise<string>,
    addGoogleHost(hostData: HostData): Promise<{ message: string, host?: IHostResponse } | string>,
    getAllHostels(): Promise<IHostel[] | string>,
    findHostById(id: Types.ObjectId, projection?: any): Promise<IHostResponse | string>,
    getAllCategory(): Promise<ICategory[] | string>,
    uploadDocument(host_id: Types.ObjectId, photo: string | undefined, documentType: string): Promise<string>,
    changePassword(hostData: { hostId: Types.ObjectId; currentPassword: string; newPassword: string }): Promise<string>,
    editProfile(hostData: { hostId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    getAllUsers(): Promise<IUser[] | string | null>,
    getHost(skip: number, limit: number): Promise<{ hosts: IHostResponse[]; totalCount: number } | null>,
    allHost(): Promise<IHostResponse[] | string | null>,
    approveHost(hostId: mongoose.Types.ObjectId): Promise<string>,
    searchHost(name: string): Promise<IHostResponse[] | string | null>,
    getHostHostelData(hostId: string): Promise<IUpdateHostelInput[] | string | null>,
    getHostDetails(userId: string): Promise<string | IHostResponse | null>,
    rejectHost(hostId: mongoose.Types.ObjectId): Promise<string>,
    hostDelete(hostId: Types.ObjectId): Promise<string>,
    hostUnBlock(hostId: Types.ObjectId): Promise<string>,
    hostBlock(hostId: Types.ObjectId): Promise<string>,
    createGoogleAuth(data: { email: string, name: string, userType: string, mobile: string }): Promise<string>
    
}