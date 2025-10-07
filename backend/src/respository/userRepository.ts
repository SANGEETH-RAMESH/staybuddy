import { IUserRespository } from "../interface/user/!UserRepository";
import Otp, { IOtp } from "../model/otpModel";
import User, { IUser } from '../model/userModel';
import { ProjectionType, Types } from "mongoose";
import baseRepository from "./baseRespository";
import { Messages } from "../messages/messages";
import { INotificationResponse } from "../dtos/NotficationResponse";
import Notification from "../model/notificationModel";





class userRespository extends baseRepository<IUser> implements IUserRespository {
    constructor() {
        super(User)
    }


    async findUserByEmail(email: string): Promise<IUser | null> {
        try {

            const userData = await this.findByEmail({ email })
            if (!userData) return null;
            return userData;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findUserById(id: string | Types.ObjectId, projection?: ProjectionType<IUser>): Promise<IUser | null> {
        try {
            const userData = await this.findById(id, projection)
            if (!userData) return null;
            return userData;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findOtpByEmail(email: string): Promise<IOtp | null> {
        try {
            const user = await Otp.findOne({ email });
            return user
        } catch (error) {
            console.log(error);
            throw error
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

    async insertUser(userData: Partial<IUser>): Promise<string | null> {
        try {
            const newUser = new User(userData);
            await newUser.save();
            return Messages.Added
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


    async resetPassword(email: string, hashedPassword: string): Promise<boolean> {
        try {
            const updated = await User.updateOne(
                { email },
                { $set: { password: hashedPassword, temp: undefined } }
            );
            return updated.modifiedCount > 0;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
        try {
            const result = await User.updateOne(
                { _id: userId },
                { $set: { password: hashedPassword } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            return false;
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

    async getUser(page: number, limit: number): Promise<{ users: IUser[]; totalCount: number } | string | null> {
        try {
            const skipCount = (page - 1) * limit;

            const users = await User.find({ isAdmin: false })
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

    async searchUser(name: string): Promise<IUser[] | string> {
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

    async getAllUsers(): Promise<IUser[] | string | null> {
        try {
            const allUsers = await User.find({ isAdmin: false });
            return allUsers
        } catch (error) {
            return error as string
        }
    }
}

export default userRespository