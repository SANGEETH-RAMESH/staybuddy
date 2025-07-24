import { ObjectId, Types } from "mongoose";
import { IUser } from "../../model/userModel"
import { IHostel } from "../../model/hostelModel";
import { IWallet } from "../../model/walletModel";
import { IOrder } from "../../model/orderModel";
import { IWishlist } from "../../model/wishlistModel";
import { IUserResponse } from "../../dtos/UserResponse";
import { IHost } from "../../model/hostModel";
import { INotification } from "../../model/notificationModel";
// type UserType = InstanceType<typeof User>;
interface UserData {
    displayName?: string;
    email?: string;
}

type EditUserDetailData = {
    userId: string;
    name: string;
    mobile: string;
};


export interface IUserService {
    userSignUp(userData: IUser): Promise<string>
    verifyOtp(userOtp: { email: string; otp: number }): Promise<string>,
    verifyLogin(userData: IUser): Promise<{ message: string;accessToken?: string;refreshToken?: string;role?: string;}>,
    resendOtp(userData: IUser): Promise<string | null>,
    forgotPassword(userData: IUser): Promise<{ email: string; temp: boolean } | null>,
    resetPassword(userData: { email: string; password: string }): Promise<string | { message: string }>,
    getUserDetails(userId: Types.ObjectId): Promise<IUserResponse | null>
    changePassword(userData: { userId: string; currentPassword: string; newPassword: string }): Promise<string>,
    editUserDetail(userData: EditUserDetailData): Promise<string>,
    googleSignUp(userData: UserData): Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    existingUser(email: string): Promise<string>,
    validateRefreshToken(refreFshToken:string):Promise<{  accessToken: string; refreshToken: string } | string>,    
    allHost(): Promise<IHost[] | string | null>,
    sendNotification(notification:INotification):Promise<INotification | string | null>,
    getOldNotification(userId:string):Promise<INotification [] | string | null>,
    markAllRead(userId: string): Promise<string>,
    createGoogleAuth(credential: string): Promise<{ message: string; accessToken: string; refreshToken: string;role:string } | string> 
}