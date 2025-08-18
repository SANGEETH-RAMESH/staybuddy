import { Types } from "mongoose";

import { INotificationResponse } from "../../dtos/NotficationResponse";
import { IUser } from "../../model/userModel";
import { ChangePasswordData } from "../../dtos/ChangePasswordData";
import { IOtp } from "../../model/otpModel";






export interface IUserRespository {
    findOtpByEmail(email: string): Promise<IOtp | null>,
    findUserByEmail(email: string): Promise<IUser | null>,
    otpGenerating(email: string, otp: number): Promise<void>,
    insertUser(userData: Partial<IUser>): Promise<string | null>,
    createUser(userData: { email: string, otp: number }): Promise<string>,
    userVerifyLogin(email: string): Promise<IUser | string>,
    resetPassword(email:string,hashedPassword:string): Promise<boolean>,
    findUserById(id: string | Types.ObjectId,projection?:any): Promise<IUser | null>,
    updatePassword(userId: string, hashedPassword: string): Promise<boolean>,
    editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string>,
    sendNotification(notification: INotificationResponse): Promise<INotificationResponse | string | null>,
    getOldNotification(userId: string): Promise<INotificationResponse[] | string | null>,
    markAllRead(userId: string): Promise<string>,
    getUser(page: number, limit: number): Promise<{ users: IUser[]; totalCount: number } | string | null>,
    createGoogleAuth(data: { email: string, name: string, userType: string, mobile: string }): Promise<string>,
    userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUser | null; error?: string }>,
    userBlock(userId: Types.ObjectId): Promise<string>,
    searchUser(name: string): Promise<IUser[] | string>,
    userDelete(userId: Types.ObjectId): Promise<string>,
    getAllUsers(): Promise<IUser[] | string | null>
}