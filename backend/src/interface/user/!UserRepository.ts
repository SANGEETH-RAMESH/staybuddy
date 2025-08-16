import { Types } from "mongoose";

import { IUserResponse } from "../../dtos/UserResponse";
import { INotificationResponse } from "../../dtos/NotficationResponse";
import { IUser } from "../../model/userModel";
import { ChangePasswordData } from "../../dtos/ChangePasswordData";





type ResetPasswordData = {
    email: string;
    newPassword: string;
    confirmPassword: string;
};


export interface IUserRespository {
    otpVerifying(userData: { email: string; otp: number }): Promise<string>,
    findUserByEmail(email: string): Promise<IUserResponse | null>,
    otpGenerating(email: string, otp: number): Promise<void>,
    tempStoreUser(userData: IUserResponse): Promise<string | null>,
    createUser(userData: { email: string, otp: number }): Promise<string>,
    userVerifyLogin(email: string): Promise<IUser | string>,
    resetPassword(userData: ResetPasswordData): Promise<string | { message: string }>,
    findUserById(id: Types.ObjectId,projection?:any): Promise<IUserResponse | null>,
    changePassword(userData: ChangePasswordData): Promise<string>,
    editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    sendNotification(notification: INotificationResponse): Promise<INotificationResponse | string | null>,
    getOldNotification(userId: string): Promise<INotificationResponse[] | string | null>,
    markAllRead(userId: string): Promise<string>,
    getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null>,
    createGoogleAuth(data: { email: string, name: string, userType: string, mobile: string }): Promise<string>,
    userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUserResponse | null; error?: string }>,
    userBlock(userId: Types.ObjectId): Promise<string>,
    searchUser(name: string): Promise<IUserResponse[] | string>,
    userDelete(userId: Types.ObjectId): Promise<string>,
    getAllUsers(): Promise<IUserResponse[] | string | null>
}