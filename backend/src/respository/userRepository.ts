import { IUserRespository } from "../interface/user/!UserRepository";
// import generateToken from "../Jwt/jwt";
// import { generateAccessToken, generateRefreshToken } from "../Jwt/jwt";
import Otp from "../model/otpModel";
import User, { IUser } from '../model/userModel';
// import { userPayload } from "../types/commonInterfaces/tokenInterface";
import HashedPassword from "../utils/hashedPassword";
import bcrypt from 'bcrypt'
import { Types } from "mongoose";
import baseRepository from "./baseRespository";
import Hostel, { IHostel } from "../model/hostelModel";
import Wallet, { IWallet } from "../model/walletModel";
import Order, { IOrder } from "../model/orderModel";
import Wishlist, { IWishlist } from "../model/wishlistModel";

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
            const userData = await this.findByEmail(email)
            // console.log(userData,'userData')
            return userData
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async FindUserById(id: Types.ObjectId): Promise<IUser | null> {
        try {
            // console.log(id,'id')
            // const userss = await User.find()
            // console.log(userss)
            const userData = await this.findById(id)
            // console.log(userData)
            return userData
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
            console.log(userData.otp, user.otp, 'ssiii')
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

    async UserVerifyLogin(userData: TempUserData): Promise<{ message: string, user: IUser } | string> {
        try {
            const checkuser = await User.findOne({ email: userData.email, isAdmin: false });
            console.log(checkuser, "Check")
            if (checkuser && checkuser.isBlock !== true) {
                const isMatch = await bcrypt.compare(userData.password, checkuser.password);

                if (isMatch) {
                    return { message: "Success", user: checkuser };
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

            // Compare current password with the stored one
            const isMatch = await bcrypt.compare(userData.currentPassword, findUser.password);
            if (isMatch) {
                // Check if new password is the same as the current password
                const isPasswordSame = await bcrypt.compare(userData.newPassword, findUser.password);
                if (isPasswordSame) {
                    return "New password cannot be the same as the current password";
                }

                // Hash the new password and update it in the database
                const hashedPassword = await bcrypt.hash(userData.newPassword, 10);
                const updatePassword = await User.updateOne(
                    { email: userData.email },
                    { $set: { password: hashedPassword } }
                );

                // Handle the update result
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
            console.log(updatingUserDetails, 'e')
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

    async addGoogleUser(userData: UserData): Promise<{ message: string, user?: IUser } | string> {
        try {
            console.log(userData, 'user')
            const alreadyUser = await User.findOne({ email: userData.email });
            if (alreadyUser) {
                return { message: "Already", user: alreadyUser }
            }

            const newUser = new User({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                mobile: userData.mobile,
                isAdmin: false,   // Assuming default value is false
                isBlock: false,   // Assuming default value is false
                wallet_id: null,  // Assuming default value is null
                temp: false,      // Assuming default value is false
            });
            newUser.set('tempExpires', undefined);
            await newUser.save();


            const userFind: IUser | null = await User.findOne({ email: newUser.email });
            if (userFind === null) {
                return { message: 'User not found after creation' };
            }
            // console.log(newUser, 'userrrrrr');
            return { message: 'Success', user: userFind }
        } catch (error) {
            return error as string
        }
    }

    async getHostels(): Promise<IHostel[] | string> {
        try {
            const getHostel = await Hostel.find();
            return getHostel
        } catch (error) {
            return error as string
        }
    }

    async getSingleHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            // console.log(id,'respository')
            const getHostel = await Hostel.findOne({ _id: id }).populate('host_id')
            console.log(getHostel, 'heeeeee')
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

            const findUser = await this.findByEmail(email)
            if (!findUser) {
                return "User not found"
            }
            const creatingWallet = new Wallet({
                userOrHostId: findUser._id
            })
            await creatingWallet.save();
            return "success"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async findUserWallet(id: string): Promise<IWallet | string | null> {
        try {
            const userWallet = await Wallet.aggregate([
                { $match: { userOrHostId: id } }, // Match wallet by userOrHostId
                {
                    $addFields: {
                        transactionHistory: {
                            $sortArray: { input: "$transactionHistory", sortBy: { date: -1 } }
                        }
                    }
                }
            ]);
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
                    $inc: { balance: parseFloat(amount) }, // Convert amount to a number
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

    async getSavedBookings(id: Types.ObjectId): Promise<IOrder[] | string | null> {
        try {
            const findBookings = await Order.find({ userId: id }).populate('hostel_id.id');
            console.log(findBookings, 'finddd')
            return findBookings
        } catch (error) {
            return error as string
        }
    }

    async addToWishlist(id: string, userId: string): Promise<string> {
        try {
            const hostelDetails = await Hostel.findOne({ _id: id })
            console.log("hostel", hostelDetails)
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
                console.log(newWishList, "Wishlist,")
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

    async deleteWishlist(userId:string): Promise<string> {
        try {
            const deletingWishlist = await Wishlist.deleteMany(
                {user_id:userId}
            )
            if(deletingWishlist){
                return "Wishlist Deleted"
            }
            return "Wishlist Not Deleted"
            
        } catch (error) {
            return error as string
        }
    }
}

export default userRespository