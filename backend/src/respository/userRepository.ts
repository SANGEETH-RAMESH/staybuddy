import { IUserRespository } from "../interface/user/!UserRepository";
import Otp from "../model/otpModel";
import User, { IUser } from '../model/userModel';
import HashedPassword from "../utils/hashedPassword";
import bcrypt from 'bcrypt'
import { Types } from "mongoose";
import baseRepository from "./baseRespository";
import { IUserResponse } from "../dtos/UserResponse";
import { Messages } from "../messages/messages";
import { INotificationResponse } from "../dtos/NotficationResponse";
import Notification from "../model/notificationModel";

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


    async findUserByEmail(email: string): Promise<IUserResponse | null> {
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

    async findUserById(id: Types.ObjectId,projection?:any): Promise<IUserResponse | null> {
        try {
            const userData = await this.findById(id,projection)
            if (!userData) return null;
            // const userResponse: IUserResponse = {
            //     name: userData.name,
            //     email: userData.email,
            //     mobile: userData.mobile,
            //     isBlock: userData.isBlock,
            //     wallet_id: userData.wallet_id ? userData.wallet_id : null,
            //     userType: userData.userType
            // };
            return userData;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async otpVerifying(userData: { email: string; otp: number }): Promise<string> {
        try {
            const user = await Otp.findOne({ email: userData.email });
            if (!user) {
                return Messages.UserNotFound;
            }
            if (user?.otp === userData.otp) {
                return Messages.UserVerified;
            } else {
                return Messages.OtpNotVerified;
            }
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async otpGenerating(email: string, otp: number): Promise<void> {
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

    async tempStoreUser(userData: IUserResponse): Promise<string | null> {
        try {
            const alreadyUser = await User.findOne({ email: userData.email });
            if (!userData.password) {
                return Messages.InvalidPassword;
            }

            if (!alreadyUser) {
                const hashedPassword = await HashedPassword.hashPassword(userData.password);
                const tempAddingUser = new User({
                    name: userData.name,
                    mobile: userData.mobile,
                    email: userData.email,
                    password: hashedPassword,
                    temp: true,
                    userType: 'local'
                });
                await tempAddingUser.save();
                return Messages.Added;
            }
            return Messages.UserAlreadyExist;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async createUser(userData: { email: string, otp: number }): Promise<string> {
        try {
            const checkingotp = await Otp.findOne({ email: userData.email })
            const checkinguser = await User.findOne({ email: userData.email })
            if (checkinguser && checkingotp) {
                checkinguser.temp = false
                checkinguser.tempExpires = undefined
                await checkinguser.save();
                return Messages.success;
            }
            return Messages.OtpExpired;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async userVerifyLogin(email: string): Promise<IUser | string> {
        try {
            const checkuser = await User.findOne({ email: email, isAdmin: false }) as IUser;
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
                return { message: Messages.UserNotFoundOrPassword };
            }
            if (typeof userData.password !== 'string') {
                return { message: Messages.InvalidPasswordFormat };
            }
            const isMatch = await bcrypt.compare(userData.password, existingUser.password);
            if (isMatch) {
                return Messages.SamePassword;
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                existingUser.password = hashedPassword;
                existingUser.tempExpires = undefined;
                await existingUser.save();
                return Messages.PasswordChanged;
            }
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async changePassword(userData: ChangePasswordData): Promise<string> {
        try {
            const findUser = await User.findOne({ _id: userData.userId });
            if (!findUser) {
                return Messages.UserNotFound;
            }
            const isMatch = await bcrypt.compare(userData.currentPassword, findUser.password);
            if (isMatch) {
                const isPasswordSame = await bcrypt.compare(userData.newPassword, findUser.password);
                if (isPasswordSame) {
                    return Messages.NewPasswordCannotbeSame;
                }

                const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
                const updatePassword = await User.updateOne(
                    { _id: userData.userId },
                    { $set: { password: hashedPassword } }
                );

                if (updatePassword.matchedCount === 0) {
                    return Messages.NoUser;
                } else if (updatePassword.modifiedCount === 0) {
                    return Messages.PasswordNotUpdated;
                } else {
                    return Messages.PasswordChangedSuccess;
                }
            } else {
                return Messages.CurrentPasswordDoesNotMatch;
            }
        } catch (error) {
            return error as string;
        }
    }

    async editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string> {
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
                return Messages.UserDetailsUpdated;
            } else {
                return Messages.NotUpdated;
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async sendNotification(notification: INotificationResponse): Promise<INotificationResponse | string | null> {
        try {
            console.log('hey',notification)
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

    async getOldNotification(userId: string): Promise<INotificationResponse[] | string | null> {
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
            return Messages.Updated
        } catch (error) {
            return error as string
        }
    }

    async getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null> {
        try {
            const skipCount = (page - 1) * limit;

            const projection = {
                name: 1,
                mobile: 1,
                isBlock: 1,
                email: 1,
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

    async createGoogleAuth(data: { email: string, name: string, userType: string, mobile: string }): Promise<string> {
        try {
            const createUser = new User({
                email: data.email,
                name: data.name,
                userType: data.userType,
                mobile: data.mobile,
                tempExpires: null,
            })
            await createUser.save()
            return createUser._id.toString();
        } catch (error) {
            return error as string
        }
    }

    async userBlock(userId: Types.ObjectId): Promise<string> {
        try {
            await User.updateOne(
                { _id: userId },
                { $set: { isBlock: true } }
            )
            return Messages.UserBlocked
        } catch (error) {
            return error as string
        }
    }


    async userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUser | null; error?: string }> {
        try {
            await User.updateOne(
                { _id: userId },
                { $set: { isBlock: false } }
            );
            const data = await User.findOne({ _id: userId });
            return { message: Messages.Unblocked, userUnBlock: data };
        } catch (error) {
            return { message: error as string, userUnBlock: null }
        }
    }

    async searchUser(name: string): Promise<IUserResponse[] | string> {
        try {
            const users = await User.find({
                name: { $regex: `^${name}`, $options: 'i' },
                isAdmin: false
            });
            return users;
        } catch (error) {
            return error as string;
        }
    }

    async userDelete(userId: Types.ObjectId): Promise<string> {
        try {
            await this.deleteById(userId)
            return Messages.UserDeleted
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllUsers(): Promise<IUserResponse[] | string | null> {
        try {
            const allUsers = await User.find({ isAdmin: false });
            return allUsers
        } catch (error) {
            return error as string
        }
    }
}

export default userRespository