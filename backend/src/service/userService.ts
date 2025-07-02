import { IUserService } from "../interface/user/!UserService";
import { IUserRespository } from "../interface/user/!UserRepository";
import { sendOtp } from "../utils/mail";
import { IUser } from "../model/userModel";
import { Types } from "mongoose";
import { userPayload } from "../types/commonInterfaces/tokenInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../Jwt/jwt";
import HashedPassword from "../utils/hashedPassword";
import { IHostel } from "../model/hostelModel";
import { IWallet } from "../model/walletModel";
import { IOrder } from "../model/orderModel";
import { IWishlist } from "../model/wishlistModel";
import { IUserResponse } from "../dtos/UserResponse";
import { IHost } from "../model/hostModel";
import { INotification } from "../model/notificationModel";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import { IHostRepository } from "../interface/host/!HostRepository";


interface ResetPasswordData {
    email: string;
    password: string; 
    newPassword: string;
}

interface ChangePasswordData {
    email: string;
    currentPassword: string;  
    newPassword: string;
}

interface UserData {
    displayName?: string;
    email?: string;
}


function otpgenerator(): number {
    return Math.floor(1000 + Math.random() * 9000);
}

function generateRandomMobileNumber() {
    const firstDigit = Math.floor(Math.random() * 5) + 6; 
    let mobileNumber = firstDigit.toString();
    for (let i = 0; i < 9; i++) {
        mobileNumber += Math.floor(Math.random() * 10).toString();
    }

    return mobileNumber;
}

function generateRandomPassword() {
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let password = '';

    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    const allCharacters = lowerCase + upperCase + numbers;
    for (let i = 0; i < 5; i++) {
        password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}

class UserService implements IUserService {
    constructor(private userRepository: IUserRespository,private walletRepository:IWalletRepository,private hostRepository:IHostRepository) { }

    async userSignUp(userData: IUser): Promise<string> {
        try {
            const existingUser = await this.userRepository.FindUserByEmail(userData.email);
            if (existingUser && !existingUser.isAdmin) {
                return "User already exists";
            }
            const otp = otpgenerator();
            sendOtp(userData.email, otp);
            await this.userRepository.OtpGenerating(userData.email, otp);
            await this.userRepository.tempStoreUser(userData);

            return "Otp sent successfully";
        } catch (error) {
            console.error(error);
            throw new Error("Error during signup");
        }
    }

    async verifyOtp(userOtp: { email: string; otp: number }): Promise<string> {
        try {
            const verifiedOtp = await this.userRepository.otpVerifying(userOtp);
            console.log(verifiedOtp, "OTp")
            if (verifiedOtp === 'OTP not verified') {
                return "Invalid OTP";
            }
            const user = await this.userRepository.CreateUser(userOtp);
            if (user == 'success') {
                await this.walletRepository.createWallet(userOtp.email)
            }
            return user;
        } catch (error) {
            console.error(error);
            return error as string
        }
    }

    async verifyLogin(userData: IUser): Promise<{ message: string; accessToken: string; refreshToken: string } | string> {
        try {
            console.log('loginnn')
            const checkingUser = await this.userRepository.UserVerifyLogin(userData);
            console.log(checkingUser, 'userrr');

            let accessToken = '';
            let refreshToken = '';

            if (typeof checkingUser !== 'string' && checkingUser.message === 'Success') {
                const userPayload: userPayload = {
                    _id: new Types.ObjectId(checkingUser.user._id),
                    role:'user'
                };

                accessToken = generateAccessToken(userPayload);
                refreshToken = generateRefreshToken(userPayload);
            }

            if (typeof checkingUser === 'string') {
                return checkingUser;
            }

            return { message: checkingUser.message, accessToken, refreshToken };
        } catch (error) {
            console.error(error);
            return error as string
        }
    }

    async resendOtp(userData: IUser): Promise<string | null> {
        try {
            const otp = otpgenerator();
            sendOtp(userData.email, otp);
            await this.userRepository.OtpGenerating(userData.email, otp);
            await this.userRepository.tempStoreUser(userData);
            return 'OTP resent successfully';
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async forgotPassword(userData: IUser): Promise<{ email: string; temp: boolean } | null> {
        try {

            const userFind = await this.userRepository.FindUserByEmail(userData.email);
            // console.log(userFind,'hello')
            if (!userFind) {
                return null;
            }
            const otp = otpgenerator();
            sendOtp(userData.email, otp);
            await this.userRepository.OtpGenerating(userData.email, otp);
            return {
                email: userFind.email,
                temp: userFind.temp?? false
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async resetPassword(userData: { email: string; password: string }): Promise<string | { message: string }> {
        try {
            const resetData: ResetPasswordData = {
                email: userData.email,
                password: userData.password,
                newPassword: userData.password,
            };
            const existingUser = await this.userRepository.FindUserByEmail(resetData.email)
            if (existingUser) {
                const changedPassword = await this.userRepository.resetPassword(resetData);
                return changedPassword;
            }
            return "No User"

        } catch (error) {
            console.error(error);
            throw new Error("Error resetting password");
        }
    }

    async existingUser(email: string): Promise<string> {
        try {


            const response = await this.userRepository.FindUserByEmail(email);
            if (response) {
                return "Success"
            }
            return "Not success"
        } catch (error) {
            console.error(error);
            throw new Error("Error resetting password");
        }
    }

    async getUserDetails(userId: Types.ObjectId): Promise<IUserResponse | null> {
        try {
            const response = await this.userRepository.FindUserById(userId);
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async changePassword(userData: { email: string; currentPassword: string; newPassword: string }): Promise<string> {
        try {
            const changePasswordData: ChangePasswordData = {
                email: userData.email,
                currentPassword: userData.currentPassword,
                newPassword: userData.newPassword,
            };

            const response = await this.userRepository.changePassword(changePasswordData);
            return response;
        } catch (error) {
            console.error(error);
            return "Error changing password";
        }
    }

    async editUserDetail(userData: IUserResponse): Promise<string> {
        try {
            const response = await this.userRepository.editUserDetail(userData);
            return response;
        } catch (error) {
            console.error(error);
            return "Error updating user details";
        }
    }

    async googleSignUp(userData: UserData): Promise<{ message: string; accessToken: string; refreshToken: string } | string> {
        try {
            const password = generateRandomPassword();
            const mobile = generateRandomMobileNumber();
            const hashed = await HashedPassword.hashPassword(password);
            const data = { ...userData, password: hashed, mobile }
            const response = await this.userRepository.addGoogleUser(data);
            // console.log(response,'responseeee')
            if (typeof response === 'object' && response !== null && 'message' in response) {
                if (response.message === 'Success') {
                    const userPayload: userPayload = {
                        _id: new Types.ObjectId(response.user?._id),
                        role:'user'
                    };
                    const accessToken = generateAccessToken(userPayload);
                    const refreshToken = generateRefreshToken(userPayload);
                    return { message: response.message, accessToken, refreshToken };
                } else if (response.message == 'Already') {
                    const userPayload: userPayload = {
                        _id: new Types.ObjectId(response.user?._id),
                        role:'user'
                    };
                    const accessToken = generateAccessToken(userPayload);
                    const refreshToken = generateRefreshToken(userPayload);
                    return { message: "Success", accessToken, refreshToken };
                }
            }
            return response as string
        } catch (error) {
            return error as string
        }
    }


    async validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string> {
        try {
            const decoded = verifyToken(refreshToken)
            if (typeof decoded === 'object' && decoded !== null) {
                const response = await this.userRepository.FindUserById(decoded._id);
                if (!response) {
                    return "No User";
                }
                const userPayload: userPayload = {
                    _id: new Types.ObjectId(response._id),
                    role:'user'
                }

                const accessToken = generateAccessToken(userPayload);
                const newRefreshToken = generateRefreshToken(userPayload);
                return { accessToken, refreshToken: newRefreshToken };
            }

            return "Invalid Token";
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    

    

    async allHost(): Promise<IHost[] | string | null> {
        try {
            const response = await this.hostRepository.allHost();
            return response;
        } catch (error) {
            return error as string
        }
    }

    async sendNotification(notification: INotification): Promise<INotification | string | null> {
        try {
            const response = await this.userRepository.sendNotification(notification);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getOldNotification(userId: string): Promise<INotification[] | string | null> {
        try {
            const response = await this.userRepository.getOldNotification(userId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async markAllRead(userId: string): Promise<string> {
        try {
            const response = await this.userRepository.markAllRead(userId);
            return response
        } catch (error) {
            return error as string
        } 
    }
}

export default UserService;
