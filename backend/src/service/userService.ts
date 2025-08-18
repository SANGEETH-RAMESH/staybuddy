import { IUserService } from "../interface/user/!UserService";
import { IUserRespository } from "../interface/user/!UserRepository";
import { sendOtp } from "../utils/mail";
import { Types } from "mongoose";
import { userPayload } from "../types/commonInterfaces/tokenInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../Jwt/jwt";
import bcrypt from 'bcrypt';
import { IUserResponse } from "../dtos/UserResponse";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import { IHostRepository } from "../interface/host/!HostRepository";
import jwt from 'jsonwebtoken';
import { Messages } from "../messages/messages";
import { IHostResponse } from "../dtos/HostResponse";
import { INotificationResponse } from "../dtos/NotficationResponse";
import { otpgenerator } from '../utils/otp';
import { UserDto } from "../dto/response/userdto";
import HashedPassword from "../utils/hashedPassword";
import { IUser } from "../model/userModel";








class UserService implements IUserService {
    constructor(private _userRepository: IUserRespository, private _walletRepository: IWalletRepository, private _hostRepository: IHostRepository) { }

    async userSignUp(userData: IUserResponse): Promise<string> {
        try {
            const existingUser = await this._userRepository.findUserByEmail(userData.email);
            if (existingUser && !existingUser.isAdmin && existingUser.temp == false) {
                return Messages.UserAlreadyExist;
            }
            const otp = otpgenerator();
            sendOtp(userData.email, otp);
            await this._userRepository.otpGenerating(userData.email, otp);
            if (!userData.password) {
                return Messages.InvalidPassword;
            }

            const hashedPassword = await HashedPassword.hashPassword(userData.password);

            await this._userRepository.insertUser({
                name: userData.name,
                mobile: userData.mobile,
                email: userData.email,
                password: hashedPassword,
                temp: true,
                userType: "local"
            })


            return Messages.OtpSentSuccess;
        } catch (error) {
            return error as string;
        }
    }

    async verifyOtp(userOtp: { email: string; otp: number }): Promise<string> {
        try {
            const user = await this._userRepository.findOtpByEmail(userOtp.email);
            if (!user) {
                return Messages.UserNotFound;
            }
            if (userOtp.otp !== user.otp) {
                return Messages.InvalidOtp;
            }
            if (userOtp.otp == user.otp) {
                const createUser = await this._userRepository.createUser(userOtp);
                if (createUser == Messages.success) {
                    await this._walletRepository.createWallet(userOtp.email)
                }
            }
            return Messages.success;
        } catch (error) {
            return error as string
        }
    }

    async verifyLogin(userData: IUserResponse): Promise<{
        message: string;
        accessToken?: string;
        refreshToken?: string;
        role?: string;
    }> {
        try {
            const checkingUser = await this._userRepository.userVerifyLogin(userData.email);
            if (!checkingUser) {
                return { message: Messages.InvalidEmail }
            }
            if (typeof checkingUser === 'string') {
                return { message: checkingUser };
            }


            if (checkingUser?.isBlock) {
                return { message: Messages.UserIsBlocked };
            }
            if (!checkingUser.password || !userData.password) {
                return { message: Messages.InvalidPassword }
            }

            const isMatch = await bcrypt.compare(userData.password, checkingUser.password);
            if (!isMatch) {
                return { message: Messages.InvalidPassword };
            }

            const userPayload = {
                _id: checkingUser._id as Types.ObjectId,
                role: 'user' as const
            };

            const accessToken = generateAccessToken(userPayload);
            const refreshToken = generateRefreshToken(userPayload);
            return {
                message: Messages.Success,
                accessToken,
                refreshToken,
                role: 'user'
            };
        } catch (error) {
            return { message: error as string };
        }
    }

    async resendOtp(userData: Partial<IUser>): Promise<string | null> {
        try {
            const otp = otpgenerator();
            sendOtp(userData.email!, otp);
            await this._userRepository.otpGenerating(userData.email!, otp);
            if (!userData.password) {
                return Messages.InvalidPassword;
            }
            const hashedPassword = await HashedPassword.hashPassword(userData.password);
            await this._userRepository.insertUser({
                name: userData.name,
                mobile: userData.mobile,
                email: userData.email,
                password: hashedPassword,
                temp: true,
                userType: "local",
            })
            return Messages.OtpResentSucess;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async forgotPassword(userData: IUserResponse): Promise<{ email: string; temp: boolean } | null> {
        try {

            const userFind = await this._userRepository.findUserByEmail(userData.email);
            if (!userFind) {
                return null;
            }
            const otp = otpgenerator();
            sendOtp(userData.email, otp);
            await this._userRepository.otpGenerating(userData.email, otp);
            return {
                email: userFind.email,
                temp: userFind.temp ?? false
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async resetPassword(userData: { email: string; newPassword: string }): Promise<string | { message: string }> {
        try {
            // const resetData = {
            //     email: userData.email,
            //     newPassword: userData.newPassword,
            //     confirmPassword: userData.newPassword,
            // };
            // const existingUser = await this._userRepository.findUserByEmail(resetData.email)
            // if (existingUser) {
            //     const changedPassword = await this._userRepository.resetPassword(resetData);
            //     return changedPassword;
            // }
            // return Messages.NoUser
            const existingUser = await this._userRepository.findUserByEmail(userData.email);
            if (!existingUser || !existingUser.password) {
                return Messages.UserNotFoundOrPassword;
            }

            const isSame = await bcrypt.compare(userData.newPassword, existingUser.password);
            if (isSame) return Messages.SamePassword;
            const hashed = await bcrypt.hash(userData.newPassword, 10);
            const updated = await this._userRepository.resetPassword(userData.email, hashed);
            return updated ? Messages.PasswordChanged : Messages.PasswordChangeFailed;

        } catch (error) {
            return error as string
        }
    }

    async existingUser(email: string): Promise<string> {
        try {


            const response = await this._userRepository.findUserByEmail(email);
            if (response) {
                return Messages.Success
            }
            return Messages.NotSuccess
        } catch (error) {
            return error as string
        }
    }

    async getUserDetails(userId: Types.ObjectId): Promise<UserDto | null> {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) return null;
            return UserDto.from(user)
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async changePassword(userData: { userId: string; currentPassword: string; newPassword: string }): Promise<string> {
        try {
            const user = await this._userRepository.findUserById(userData.userId);
            if (!user) return Messages.UserNotFound;

            const isCurrentMatch = await bcrypt.compare(userData.currentPassword, user.password);
            if (!isCurrentMatch) return Messages.CurrentPasswordDoesNotMatch;

            const isSamePassword = await bcrypt.compare(userData.newPassword, user.password);
            if (isSamePassword) return Messages.NewPasswordCannotbeSame;

            const hashed = await bcrypt.hash(userData.newPassword, 10);
            const updated = await this._userRepository.updatePassword(userData.userId, hashed);

            return updated ? Messages.PasswordChangedSuccess : Messages.PasswordNotUpdated;
        } catch (error) {
            console.error(error);
            return error as string
        }
    }

    async editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string> {
        try {
            const response = await this._userRepository.editUserDetail(userData);
            return response;
        } catch (error) {
            console.error(error);
            return error as string;
        }
    }


    async validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string> {
        try {
            console.log(refreshToken)
            const decoded = verifyToken(refreshToken)
            if (typeof decoded === 'object' && decoded !== null) {
                const response = await this._userRepository.findUserById(decoded._id);
                if (!response) {
                    return Messages.NoUser;
                }
                const userPayload: userPayload = {
                    _id: new Types.ObjectId(response._id),
                    role: 'user'
                }

                const accessToken = generateAccessToken(userPayload);
                const refreshToken = generateRefreshToken(userPayload);
                return { accessToken, refreshToken };
            }

            return Messages.InvalidToken;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }





    async allHost(): Promise<IHostResponse[] | string | null> {
        try {
            const response = await this._hostRepository.allHost();
            return response;
        } catch (error) {
            return error as string
        }
    }

    async sendNotification(notification: INotificationResponse): Promise<INotificationResponse | string | null> {
        try {
            console.log(notification, 'Notiii')
            const response = await this._userRepository.sendNotification(notification);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getOldNotification(userId: string): Promise<INotificationResponse[] | string | null> {
        try {
            const response = await this._userRepository.getOldNotification(userId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async markAllRead(userId: string): Promise<string> {
        try {
            const response = await this._userRepository.markAllRead(userId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async createGoogleAuth(credential: string): Promise<{ message: string; accessToken: string; refreshToken: string; role: string } | string> {
        try {
            const payload = jwt.decode(credential);
            if (!payload || typeof payload === 'string') {
                return Messages.NoUser
            }
            const checkUser = await this._userRepository.findUserByEmail(payload.email)
            if (checkUser) {
                const userPayload = {
                    _id: checkUser._id as Types.ObjectId,
                    role: 'user' as const
                };
                const accessToken = generateAccessToken(userPayload);
                const refreshToken = generateRefreshToken(userPayload);
                return { message: Messages.UserAlreadyExist, accessToken, refreshToken, role: 'user' }
            }

            const data = {
                email: payload.email,
                name: payload?.name,
                userType: 'google',
                mobile: '',
            }
            const id = await this._userRepository.createGoogleAuth(data)
            await this._walletRepository.createWallet(payload.email)
            const userPayload = {
                _id: new Types.ObjectId(id),
                role: 'user' as const
            };
            const accessToken = generateAccessToken(userPayload);
            const refreshToken = generateRefreshToken(userPayload);
            return { message: Messages.UserCreated, accessToken, refreshToken, role: 'user' }
        } catch (error) {
            return error as string
        }
    }
}

export default UserService;
