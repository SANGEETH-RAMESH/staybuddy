import { Types } from "mongoose";
import { IUser } from "../../model/userModel";
import { IHostel } from "../../model/hostelModel";
import { IWallet } from "../../model/walletModel";
import { IOrder } from "../../model/orderModel";
import { IWishlist } from "../../model/wishlistModel";

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
    FindUserByEmail(email:string):Promise<IUser | null>,
    OtpGenerating(email:string,otp:number):Promise<void>,
    tempStoreUser(userData: TempUserData): Promise<string | null>,
    CreateUser(userData: {email:string,otp:number}): Promise<string>,
    UserVerifyLogin(userData: TempUserData): Promise<{ message: string, user: IUser } | string>,
    resetPassword(userData: ResetPasswordData): Promise<string | { message: string }>,
    FindUserById(id:Types.ObjectId):Promise<IUser | null>,
    changePassword(userData: ChangePasswordData): Promise<string>,
    editUserDetail(userData: EditUserDetailData): Promise<string>,
    addGoogleUser(userData:UserData):Promise<{ message: string, user?: IUser }| string>,
    getHostels():Promise<IHostel[] | string>,
    getSingleHostel(id:Types.ObjectId):Promise<IHostel | string>,
    findUserWallet(id:string):Promise<IWallet | string | null>,
    createWallet(email:string):Promise<string>,
    walletDeposit({id,amount,}: {id: string;amount: string;}): Promise<{ message: string; userWallet: IWallet } | string>,
    walletWithdraw({id,amount}:{id:string,amount:string}):Promise<string>,
    getSavedBookings(id:Types.ObjectId):Promise<IOrder[] | string | null>,
    addToWishlist(id:string,userId:string):Promise<string>,
    removeFromWishlist(hostelId:string,userId:string):Promise<string>,
    checkWishlist(userId:string,hostelId:string):Promise<string>,
    getWishlist(userId:string):Promise<string | IWishlist[]>,
    deleteWishlist(userId:string): Promise<string>
    
}