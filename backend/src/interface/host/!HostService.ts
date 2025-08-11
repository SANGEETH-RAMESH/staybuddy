import { Types } from "mongoose";
import { IHostResponse } from "../../dtos/HostResponse";
import { IUserResponse } from "../../dtos/UserResponse";
import { ICategoryResponse } from "../../dtos/CategoryResponse";
import { IOtpVerify } from "../../dtos/OtpVerify";

// interface IHostOtp {
//     email: string;
//     otp: number;
// }

// interface hostData {
//     name: string,
//     mobile: number,
//     email: string,
//     password: string
// }



// interface HostData{
//     name?:string,
//     email?:string
// }


export interface IHostService {
    signUp(hostData: IHostResponse): Promise<string>;
    verifyOtp(hostOtp: IOtpVerify): Promise<string>;
    forgotPassword(hostData:  { email: string }): Promise<IHostResponse | null>;
    resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }>;
    resendOtp(hostData: IHostResponse): Promise<string | null>;
    verifyLogin(hostData: { email: string, password: string }): Promise<{ message: string, accessToken?: string, refreshToken?: string,role?:string }>;
    newHost(host_id: Types.ObjectId): Promise<string>,
    approvalRequest(host_id:Types.ObjectId,photo:string | undefined,documentType:string):Promise<string>,
    hostGoogleSignUp(hostData:IHostResponse):Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    getHost(id:Types.ObjectId):Promise<IHostResponse | string>,
    validateRefreshToken(refreshToken:string):Promise<{  accessToken: string; refreshToken: string } | string>,
    getAllCategory(): Promise<ICategoryResponse[] | string>,
    changePassword(hostData: { hostId: Types.ObjectId; currentPassword: string; newPassword: string }): Promise<string>,
    editProfile(hostData: { hostId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    getAllUsers(): Promise<IUserResponse[] | string | null>,
    getAdmin(): Promise<IUserResponse | string | null>,
    createGoogleAuth(credential: string): Promise<{ message: string; accessToken: string; refreshToken: string; role: string } | string>
}
