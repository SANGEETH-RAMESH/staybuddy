import { Types } from "mongoose";
// import { IUser } from "../../model/userModel";
import { IHostel } from "../../model/hostelModel";
import { IWallet } from "../../model/walletModel";
import { IOrder } from "../../model/orderModel";
import { IWishlist } from "../../model/wishlistModel";
import { IUserResponse } from "../../dtos/UserResponse";
import { IUser } from "../../model/userModel";
import { IHost } from "../../model/hostModel";
import { INotification } from "../../model/notificationModel";

interface TempUserData {
    name: string;
    mobile: string;
    email: string;
    password: string;
}

type ResetPasswordData = {
    email: string;
    password: string; 
    newPassword: string;
};

type ChangePasswordData = {
    email: string;
    currentPassword: string;
    newPassword: string;
};

type EditUserDetailData = {
    email: string;
    name: string;
    mobile: string;
};

interface UserData {
    displayName?: string;
    email?: string;
}

export interface IUserRespository{
    otpVerifying(userData: { email: string; otp: number }): Promise<string>,
    FindUserByEmail(email: string):Promise<IUserResponse | null>,
    OtpGenerating(email:string,otp:number):Promise<void>,
    tempStoreUser(userData: TempUserData): Promise<string | null>,
    CreateUser(userData: {email:string,otp:number}): Promise<string>,
    UserVerifyLogin(userData: TempUserData): Promise<{ message: string, user: IUserResponse } | string>,
    resetPassword(userData: ResetPasswordData): Promise<string | { message: string }>,
    FindUserById(id:Types.ObjectId):Promise<IUserResponse | null>,
    changePassword(userData: ChangePasswordData): Promise<string>,
    editUserDetail(userData: EditUserDetailData): Promise<string>,
    addGoogleUser(userData:UserData):Promise<{ message: string, user?: IUserResponse }| string>,    
     sendNotification(notification:INotification):Promise<INotification | string | null>,
    getOldNotification(userId:string):Promise<INotification [] | string | null>,
    markAllRead(userId: string): Promise<string>,
    getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null>
    
}