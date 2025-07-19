import { IUserRespository } from "../interface/user/!UserRepository";
import Otp from "../model/otpModel";
import User, { IUser } from '../model/userModel';
import HashedPassword from "../utils/hashedPassword";
import bcrypt from 'bcrypt'
import mongoose, { Types } from "mongoose";
import baseRepository from "./baseRespository";
import Hostel, { IHostel } from "../model/hostelModel";
import Order, { IOrder } from "../model/orderModel";
import Wishlist, { IWishlist } from "../model/wishlistModel";
import { IUserResponse } from "../dtos/UserResponse";
import Host, { IHost } from "../model/hostModel";
import Notification, { INotification } from "../model/notificationModel";

type ResetPasswordData = {
    email: string;
    password: string;
    newPassword: string;
};

interface TempUserData {
    name: string;
    mobile: string;
    email: string;
    password: string;
}

interface UserData {
    name?: string;
    email?: string;
    password?: string;
    mobile?: number
}

type ChangePasswordData = {
    userId: string;
    currentPassword: string;
    newPassword: string;
};

type EditUserDetailData = {
    userId: string;
    name: string;
    mobile: string;
};

class userRespository extends baseRepository<IUser> implements IUserRespository {
    constructor() {
        super(User)
    }


    async FindUserByEmail(email: string): Promise<IUserResponse | null> {
        try {
            const projection = {
                email: 1,
                _id: 1,
                name: 1,
                mobile: 1,
                wallet_id: 1,
                isAdmin: 1,
                isBlock: 1
            }
            const userData = await this.findByEmail({ email }, projection)
            if (!userData) return null;
            return userData;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async FindUserById(id: Types.ObjectId): Promise<IUserResponse | null> {
        try {
            const userData = await this.findById(id)
            if (!userData) return null;
            const userResponse: IUserResponse = {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                isAdmin: userData.isAdmin,
                isBlock: userData.isBlock,
                wallet_id: userData.wallet_id ? userData.wallet_id : null,
            };
            return userResponse;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async otpVerifying(userData: { email: string; otp: number }): Promise<string> {
        try {
            const user = await Otp.findOne({ email: userData.email });
            if (!user) {
                return "User not found";
            }
            if (user?.otp === userData.otp) {
                return "User verified";
            } else {
                return "OTP not verified";
            }
        } catch (error) {
            console.log(error);
            return "Error during OTP verification";
        }
    }

    async OtpGenerating(email: string, otp: number): Promise<void> {
        try {
            const exisitingOtp = await Otp.findOne({ email })
            if (exisitingOtp) {
                exisitingOtp.otp = otp
                await exisitingOtp.save()
            } else {
                const otpsave = new Otp({
                    email: email,
                    otp: otp
                })
                await otpsave.save();
            }
        } catch (error) {
            console.log(error)
        }
    }

    async tempStoreUser(userData: TempUserData): Promise<string | null> {
        try {
            const alreadyUser = await User.findOne({ email: userData.email });
            if (!alreadyUser) {
                const hashedPassword = await HashedPassword.hashPassword(userData.password);
                const tempAddingUser = new User({
                    name: userData.name,
                    mobile: userData.mobile,
                    email: userData.email,
                    password: hashedPassword,
                    temp: true,
                });
                await tempAddingUser.save();
                return 'added';
            }
            return 'User already exists';
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async CreateUser(userData: { email: string, otp: number }): Promise<string> {
        try {
            const checkingotp = await Otp.findOne({ email: userData.email })
            const checkinguser = await User.findOne({ email: userData.email })
            if (checkinguser && checkingotp) {
                checkinguser.temp = false
                checkinguser.tempExpires = undefined
                await checkinguser.save();
                return 'success'
            }
            return 'otp expired'
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async UserVerifyLogin(email:string): Promise< IUser | string> {
        try {
            const checkuser = await User.findOne({ email: email, isAdmin: false }) as IUser
            return checkuser
        } catch (error) {
            console.log(error);
            return error as string
        }
    }


    async resetPassword(userData: ResetPasswordData): Promise<string | { message: string }> {
        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser || !existingUser.password) {
                return { message: 'User not found or password not set' };
            }
            if (typeof userData.password !== 'string') {
                return { message: "Invalid password format" };
            }
            const isMatch = await bcrypt.compare(userData.password, existingUser.password);
            if (isMatch) {
                return 'Same password';
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                existingUser.password = hashedPassword;
                existingUser.tempExpires = undefined;
                await existingUser.save();
                return "Password Changed";
            }
        } catch (error) {
            console.log(error);
            return 'Error occurred while resetting the password';
        }
    }

    async changePassword(userData: ChangePasswordData): Promise<string> {
        try {
            const findUser = await User.findOne({ _id: userData.userId });
            if (!findUser) {
                return "User not found";
            }
            const isMatch = await bcrypt.compare(userData.currentPassword, findUser.password);
            if (isMatch) {
                const isPasswordSame = await bcrypt.compare(userData.newPassword, findUser.password);
                if (isPasswordSame) {
                    return "New password cannot be the same as the current password";
                }

                const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
                const updatePassword = await User.updateOne(
                    { _id: userData.userId },
                    { $set: { password: hashedPassword } }
                );

                if (updatePassword.matchedCount === 0) {
                    return "No user found with the provided email";
                } else if (updatePassword.modifiedCount === 0) {
                    return "Password was not updated. It might already be the same";
                } else {
                    return "Password changed successfully";
                }
            } else {
                return "Current password does not match";
            }
        } catch (error) {
            console.log(error);
            return "Error occurred while changing the password";
        }
    }

    async editUserDetail(userData: EditUserDetailData): Promise<string> {
        try {
            const updatingUserDetails = await User.updateOne(
                { _id: userData.userId },
                {
                    $set: {
                        name: userData.name,
                        mobile: userData.mobile
                    }
                }
            )
            if (updatingUserDetails.matchedCount == 1) {
                return "User details updated"
            } else {
                return "Not updated"
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async addGoogleUser(userData: UserData): Promise<{ message: string, user?: IUserResponse } | string> {
        try {
            const alreadyUser = await User.findOne({ email: userData.email }) as IUserResponse
            if (alreadyUser) {
                return {
                    message: "Already",
                    user: {
                        _id: alreadyUser?._id,
                        name: alreadyUser.name,
                        email: alreadyUser.email,
                        mobile: alreadyUser.mobile,
                        isAdmin: alreadyUser.isAdmin,
                        isBlock: alreadyUser.isBlock,
                        wallet_id: alreadyUser.wallet_id ? alreadyUser.wallet_id : null,
                    }
                };
            }
            const newUser = new User({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                mobile: userData.mobile,
                isAdmin: false,
                isBlock: false,
                wallet_id: null,
                temp: false,
            });
            newUser.set('tempExpires', undefined);
            await newUser.save();
            const userFind: IUserResponse | null = await User.findOne({ email: newUser.email });
            if (userFind === null) {
                return { message: 'User not found after creation' };
            }
            return { message: 'Success', user: userFind }
        } catch (error) {
            return error as string
        }
    }


    

    

    

    
    async sendNotification(notification: INotification): Promise<INotification | string | null> {
        try {
            const newNotification = new Notification({
                receiver: notification.receiver,
                message: notification.message,
                type: notification.type,
                title: notification.title,
                isRead: notification.isRead
            })
            await newNotification.save();
            return newNotification
        } catch (error) {
            return error as string
        }
    }

    async getOldNotification(userId: string): Promise<INotification[] | string | null> {
        try {
            const notifications = await Notification.find({
                receiver: userId
            })
                .sort({ createdAt: -1 })
            return notifications
        } catch (error) {
            return error as string
        }
    }

    async markAllRead(userId: string): Promise<string> {
        try {
            const updatingRead = await Notification.updateMany(
                { receiver: userId, isRead: true },
                {
                    $set:
                        { isRead: false }
                }
            )
            return "Updated"
        } catch (error) {
            return error as string
        }
    }

    async getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null> {
        try {
            const skipCount = (page - 1) * limit;

            const projection = {
                _id: 1,
                name: 1,
                mobile: 1,
                isAdmin: 1,
                isBlock: 1,
                email: 1
            }

            const users = await User.find({ isAdmin: false }, projection)
                .skip(skipCount)
                .limit(limit);

            const totalCount = await User.countDocuments({ isAdmin: false });

            return { users, totalCount };
        } catch (error) {
            console.log(error)
            return error as string
        }
    }
}

export default userRespository