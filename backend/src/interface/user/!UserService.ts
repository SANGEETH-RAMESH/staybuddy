import { ObjectId, Types } from "mongoose";
import { IUser } from "../../model/userModel"
import { IHostel } from "../../model/hostelModel";
import { IWallet } from "../../model/walletModel";
import { IOrder } from "../../model/orderModel";
import { IWishlist } from "../../model/wishlistModel";
import { IUserResponse } from "../../dtos/UserResponse";
import { IHost } from "../../model/hostModel";
// type UserType = InstanceType<typeof User>;
interface UserData {
    displayName?: string;
    email?: string;
}

export interface IUserService {
    userSignUp(userData: IUser): Promise<string>
    verifyOtp(userOtp: { email: string; otp: number }): Promise<string>,
    verifyLogin(userData: IUser): Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    resendOtp(userData: IUser): Promise<string | null>,
    forgotPassword(userData: IUser): Promise<{ email: string; temp: boolean } | null>,
    resetPassword(userData: { email: string; password: string }): Promise<string | { message: string }>,
    getUserDetails(userId: Types.ObjectId): Promise<IUserResponse | null>
    changePassword(userData: { email: string; currentPassword: string; newPassword: string }): Promise<string>,
    editUserDetail(userData: IUser): Promise<string>,
    googleSignUp(userData: UserData): Promise<{ message: string; accessToken: string; refreshToken: string } | string>,
    existingUser(email: string): Promise<string>,
    getHostels(page: string, limit: string,search?:string): Promise<{ hostels: IHostel[]; totalCount: number } | string>,
    getSingleHostel(id:Types.ObjectId):Promise<IHostel | string>,
    validateRefreshToken(refreshToken:string):Promise<{  accessToken: string; refreshToken: string } | string>,
    getWalletDetails(id: string): Promise<IWallet | string | null>,
    walletDeposit({id,amount,}: {id: string;amount: string;}): Promise<{ message: string; userWallet: IWallet } | string>,
    walletWithdraw({id,amount}:{id:string,amount:string}):Promise<string>,
    getSavedBookings(id: Types.ObjectId, page: string, limit: string): Promise<{ bookings: IOrder[]; totalCount: number } | string | null>,
    addToWishlist(id:string,userId:string):Promise<string>,
    removeFromWishlist(hostelId:string,userId:string):Promise<string>,
    checkWishlist(userId:string,hostelId:string):Promise<string>,
    getWishlist(userId:string):Promise<string | IWishlist[]>,
    deleteWishlist(userId:string): Promise<string>,
    allHost(): Promise<IHost[] | string | null>
}