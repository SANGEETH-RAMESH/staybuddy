import {  Types } from "mongoose";
import { IUserResponse } from "../../dtos/UserResponse";
import { IHostResponse } from "../../dtos/HostResponse";
import { INotificationResponse } from "../../dtos/NotficationResponse";
import { UserDto } from "../../dto/response/userdto";
import { IUser } from "../../model/userModel";
import { HostelDto } from "../../dto/response/hosteldto";
import { NotificationDto } from "../../dto/response/notificationdto";



// export interface IUserService {
//     userSignUp(userData: IUserResponse): Promise<string>
//     verifyOtp(userOtp: { email: string; otp: number }): Promise<string>,
//     verifyLogin(userData: IUserResponse): Promise<{ message: string;accessToken?: string;refreshToken?: string;role?: string;}>,
//     resendOtp(userData: Partial<IUser>): Promise<string | null>,
//     forgotPassword(userData: IUserResponse): Promise<{ email: string; temp: boolean } | null>,
//     resetPassword(userData: { email: string; newPassword: string }): Promise<string | { message: string }>,
//     getUserDetails(userId: Types.ObjectId): Promise<UserDto | null>
//     changePassword(userData: { userId: string; currentPassword: string; newPassword: string }): Promise<string>,
//     editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
//     existingUser(email: string): Promise<string>,
//     validateRefreshToken(refreFshToken:string):Promise<{  accessToken: string; refreshToken: string } | string>,    
//     allHost(): Promise<HostelDto[] | string | null>,
//     sendNotification(notification:INotificationResponse):Promise<NotificationDto | string | null>,
//     getOldNotification(userId:string):Promise<NotificationDto [] | string | null>,
//     markAllRead(userId: string): Promise<string>,
//     createGoogleAuth(credential: string): Promise<{ message: string; accessToken: string; refreshToken: string;role:string } | string> 
// }

export interface IUserService extends IAuthService, IHostService, INotificationService {}

export interface IAuthService {
    userSignUp(userData: IUserResponse): Promise<string>;
    verifyOtp(userOtp: { email: string; otp: number }): Promise<string>;
    verifyLogin(userData: IUserResponse): Promise<{ message: string; accessToken?: string; refreshToken?: string; role?: string }>;
    resendOtp(userData: Partial<IUser>): Promise<string | null>;
    forgotPassword(userData: IUserResponse): Promise<{ email: string; temp: boolean } | null>;
    resetPassword(userData: { email: string; newPassword: string }): Promise<string | { message: string }>;
    validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string>;
    createGoogleAuth(credential: string): Promise<{ message: string; accessToken: string; refreshToken: string; role: string } | string>;
}

export interface IProfileService {
    getUserDetails(userId: Types.ObjectId): Promise<UserDto | null>;
    changePassword(userData: { userId: string; currentPassword: string; newPassword: string }): Promise<string>;
    editUserDetail(userData: { userId: Types.ObjectId; name: string; mobile: string }): Promise<string>;
    existingUser(email: string): Promise<string>;
}

export interface IHostService {
    allHost(): Promise<HostelDto[] | string | null>;
}

export interface INotificationService {
    sendNotification(notification: INotificationResponse): Promise<NotificationDto | string | null>;
    getOldNotification(userId: string): Promise<NotificationDto[] | string | null>;
    markAllRead(userId: string): Promise<string>;
}