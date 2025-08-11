import {  Types } from "mongoose";
import { IUserResponse } from "../../dtos/UserResponse";
import { IHostResponse } from "../../dtos/HostResponse";
import { INotificationResponse } from "../../dtos/NotficationResponse";



export interface IUserService {
    userSignUp(userData: IUserResponse): Promise<string>
    verifyOtp(userOtp: { email: string; otp: number }): Promise<string>,
    verifyLogin(userData: IUserResponse): Promise<{ message: string;accessToken?: string;refreshToken?: string;role?: string;}>,
    resendOtp(userData: IUserResponse): Promise<string | null>,
    forgotPassword(userData: IUserResponse): Promise<{ email: string; temp: boolean } | null>,
    resetPassword(userData: { email: string; password: string }): Promise<string | { message: string }>,
    getUserDetails(userId: Types.ObjectId): Promise<IUserResponse | null>
    changePassword(userData: { userId: string; currentPassword: string; newPassword: string }): Promise<string>,
    editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    existingUser(email: string): Promise<string>,
    validateRefreshToken(refreFshToken:string):Promise<{  accessToken: string; refreshToken: string } | string>,    
    allHost(): Promise<IHostResponse[] | string | null>,
    sendNotification(notification:INotificationResponse):Promise<INotificationResponse | string | null>,
    getOldNotification(userId:string):Promise<INotificationResponse [] | string | null>,
    markAllRead(userId: string): Promise<string>,
    createGoogleAuth(credential: string): Promise<{ message: string; accessToken: string; refreshToken: string;role:string } | string> 
}