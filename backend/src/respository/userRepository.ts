import { IUserRespository } from "../interface/user/!UserRepository";
// import generateToken from "../Jwt/jwt";
// import { generateAccessToken, generateRefreshToken } from "../Jwt/jwt";
import Otp from "../model/otpModel";
import User, { IUser } from '../model/userModel';
// import { userPayload } from "../types/commonInterfaces/tokenInterface";
import HashedPassword from "../utils/hashedPassword";
import bcrypt from 'bcrypt'
import mongoose, { Types } from "mongoose";
import baseRepository from "./baseRespository";
import Hostel, { IHostel } from "../model/hostelModel";
import Wallet, { IWallet } from "../model/walletModel";
import Order, { IOrder } from "../model/orderModel";
import Wishlist, { IWishlist } from "../model/wishlistModel";
import { IUserResponse } from "../dtos/UserResponse";
import Host, { IHost } from "../model/hostModel";

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
    email: string;
    currentPassword: string;
    newPassword: string;
};

type EditUserDetailData = {
    email: string;
    name: string;
    mobile: string;
};

class userRespository extends baseRepository<IUser> implements IUserRespository {
    constructor() {
        super(User)
    }


    async FindUserByEmail(email: string): Promise<IUser | null> {
        try {
            // console.log(email,'email')
            const userData = await this.findByEmail({ email })
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
                _id: userData._id.toString(),
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                isAdmin: userData.isAdmin,
                isBlock: userData.isBlock,
                wallet_id: userData.wallet_id ? userData.wallet_id.toString() : null,
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
            // console.log(userData.otp, user.otp, 'ssiii')
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

    // async tempStoreUser(userData: tempsotr\\\): Promise<any> {
    //     try {
    //         const alreadyUser = await User.findOne({ email: userData.email })
    //         if (!alreadyUser) {
    //             const hashedPassword = await HashedPassword.hashPassword(userData.password)
    //             const tempAddingUser = new User({
    //                 name: userData.name,
    //                 mobile: userData.mobile,
    //                 email: userData.email,
    //                 password: hashedPassword,
    //                 temp: true
    //             })
    //             await tempAddingUser.save();
    //             return 'added'
    //         }


    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

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

    async UserVerifyLogin(userData: TempUserData): Promise<{ message: string, user: IUserResponse } | string> {
        try {
            const checkuser = await User.findOne({ email: userData.email, isAdmin: false }) as IUser
            // console.log(checkuser, "Check")
            if (checkuser && checkuser.isBlock !== true) {
                const isMatch = await bcrypt.compare(userData.password, checkuser.password);

                if (isMatch) {
                    const userResponse: IUserResponse = {
                        _id: checkuser._id.toString(),
                        name: checkuser.name,
                        email: checkuser.email,
                        mobile: checkuser.mobile,
                        isAdmin: checkuser.isAdmin,
                        isBlock: checkuser.isBlock,
                        wallet_id: checkuser.wallet_id ? checkuser.wallet_id.toString() : null,
                    };

                    return { message: "Success", user: userResponse };
                } else {
                    return 'Invalid password';
                }
            } else if (checkuser?.isBlock === true) {
                return 'User is blocked';
            } else {
                return 'Invalid email';
            }
        } catch (error) {
            console.log(error);
            return 'Error occurred during login';
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
            // console.log(userData,'usreData')
            const isMatch = await bcrypt.compare(userData.password, existingUser.password);
            // console.log("Ismatch",isMatch)
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
            // Find user by email
            const findUser = await User.findOne({ email: userData.email });
            if (!findUser) {
                return "User not found";
            }
            // console.log("Finding", userData)
            const isMatch = await bcrypt.compare(userData.currentPassword, findUser.password);
            if (isMatch) {
                const isPasswordSame = await bcrypt.compare(userData.newPassword, findUser.password);
                if (isPasswordSame) {
                    return "New password cannot be the same as the current password";
                }

                const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
                const updatePassword = await User.updateOne(
                    { email: userData.email },
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
            // console.log(userData,'userrrrrr')

            const updatingUserDetails = await User.updateOne(
                { email: userData.email },
                {
                    $set: {
                        name: userData.name,
                        mobile: userData.mobile
                    }
                }
            )
            // console.log(updatingUserDetails, 'e')
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
            // console.log(userData, 'user')
            const alreadyUser = await User.findOne({ email: userData.email }) as IUserResponse
            if (alreadyUser) {
                return {
                    message: "Already",
                    user: {
                        _id: alreadyUser?._id.toString(),
                        name: alreadyUser.name,
                        email: alreadyUser.email,
                        mobile: alreadyUser.mobile,
                        isAdmin: alreadyUser.isAdmin,
                        isBlock: alreadyUser.isBlock,
                        wallet_id: alreadyUser.wallet_id ? alreadyUser.wallet_id.toString() : null,
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
            // console.log(newUser, 'userrrrrr');
            return { message: 'Success', user: userFind }
        } catch (error) {
            return error as string
        }
    }

    async getHostels(page: string, limit: string, search: string): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);

            if (isNaN(pageNumber) || isNaN(limitNumber)) {
                return 'Invalid pagination values';
            }

            let filter = {};
            if (search && search.trim() !== '') {
                const searchRegex = new RegExp('^' + search, 'i');

                filter = {
                    $or: [
                        { hostelname: { $regex: searchRegex } },
                    ]
                };
            }

            const totalCount = await Hostel.countDocuments(filter);

            const hostels = await Hostel.find(filter)
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);

            return { hostels, totalCount };
        } catch (error) {
            return error as string;
        }
    }


    async getSingleHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            // console.log(id,'respository')
            const getHostel = await Hostel.findOne({ _id: id }).populate('host_id')
            // console.log(getHostel, 'heeeeee')
            if (!getHostel) {
                return "No Hostel"
            }
            return getHostel
        } catch (error) {
            return error as string
        }
    }

    async createWallet(email: string): Promise<string> {
        try {

            const findUser = await this.findByEmail({ email })
            if (!findUser) {
                return "User not found"
            }
            const creatingWallet = new Wallet({
                userOrHostId: findUser._id
            })
            await creatingWallet.save();

            findUser.wallet_id = creatingWallet._id as mongoose.Types.ObjectId;
            findUser.tempExpires = undefined;
            findUser.temp = false;
            await findUser.save();
            return "success"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async findUserWallet(id: string): Promise<IWallet | string | null> {
        try {

            const userWallet = await Wallet.aggregate([
                { $match: { userOrHostId: new Types.ObjectId(id) } },
                {
                    $addFields: {
                        transactionHistory: {
                            $sortArray: { input: "$transactionHistory", sortBy: { date: -1 } }
                        }
                    }
                }
            ]);
            // console.log(userWallet,'Wallet')
            if (!userWallet) {
                return "No Wallet"
            }
            return userWallet[0]
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string> {
        try {
            console.log(id, amount);
            await Wallet.findOneAndUpdate(
                { userOrHostId: id },
                {
                    $inc: { balance: parseFloat(amount) },
                    $push: {
                        transactionHistory: {
                            type: "deposit",
                            amount: parseFloat(amount),
                            date: new Date(),
                            description: "Wallet deposit",
                        },
                    },
                }
            );
            console.log("hey")
            const userWallet = await Wallet.findOne({ userOrHostId: id });
            if (!userWallet) {
                return "Wallet not found"
            }
            return { message: "Deposited", userWallet };
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }


    async walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string> {
        try {
            await Wallet.findOneAndUpdate(
                { userOrHostId: id },
                {
                    $inc: { balance: -parseFloat(amount) },
                    $push: {
                        transactionHistory: {
                            type: "withdraw",
                            amount: amount,
                            date: new Date(),
                            description: "Wallet withdraw"
                        }
                    }
                }
            )
            return "Withdrawn"
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getSavedBookings(id: Types.ObjectId, page: string, limit: string): Promise<{ bookings: IOrder[]; totalCount: number } | string | null> {
        try {
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || isNaN(limitNumber)) {
                return 'Invalid pagination values';
            }

            const skip = (pageNumber - 1) * limitNumber;
            const totalCount = await Order.countDocuments({ userId: id });
            const bookings = await Order.find({ userId: id })
                .populate('hostel_id.id')
                .populate('host_id')
                .populate('userId')
                .skip(skip)
                .limit(limitNumber);

            return { bookings, totalCount };
        } catch (error) {
            return error as string
        }
    }

    async addToWishlist(id: string, userId: string): Promise<string> {
        try {
            const hostelDetails = await Hostel.findOne({ _id: id })
            // console.log("hostel", hostelDetails)
            if (hostelDetails) {
                const newWishList = new Wishlist({
                    image: hostelDetails?.photos[0],
                    hostelname: hostelDetails.hostelname,
                    category: hostelDetails.category,
                    price: hostelDetails?.bedShareRoom,
                    isActive: true,
                    user_id: userId,
                    hostel_id: id
                })
                // console.log(newWishList, "Wishlist,")
                await newWishList.save()
                if (newWishList) {
                    return "Added to wishlist"
                }
            }


            return 'Cannot add to wishlist'
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async removeFromWishlist(hostelId: string, userId: string): Promise<string> {
        try {
            await Wishlist.findOneAndDelete(
                { hostel_id: hostelId, user_id: userId }
            )
            return 'Hostel Removed From Wishlist'
        } catch (error) {
            return error as string
        }
    }

    async checkWishlist(userId: string, hostelId: string): Promise<string> {
        try {
            const checkingWishlist = await Wishlist.findOne(
                { hostel_id: hostelId, user_id: userId }
            )
            if (checkingWishlist) {
                return "Already Exist"
            }
            return "Not Exist"
        } catch (error) {
            return error as string
        }
    }

    async getWishlist(userId: string): Promise<string | IWishlist[]> {
        try {
            const fetchWishlistData = await Wishlist.find(
                { user_id: userId }
            )
            return fetchWishlistData
        } catch (error) {
            return error as string
        }
    }

    async deleteWishlist(userId: string): Promise<string> {
        try {
            const deletingWishlist = await Wishlist.deleteMany(
                { user_id: userId }
            )
            if (deletingWishlist) {
                return "Wishlist Deleted"
            }
            return "Wishlist Not Deleted"

        } catch (error) {
            return error as string
        }
    }

    async allHost(): Promise<IHost[] | string | null> {
        try {
            const getHost = await Host.find();
            return getHost;
        } catch (error) {
            return error as string
        }
    }
}

export default userRespository