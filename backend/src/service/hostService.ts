import { IHostService } from "../interface/host/!HostService";
import { IHostRepository } from "../interface/host/!HostRepository";
import { sendOtp } from "../utils/mail";
import { Types } from "mongoose";
import HashedPassword from "../utils/hashedPassword";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../Jwt/jwt";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import bcrypt from 'bcrypt';
import { Messages } from "../messages/messages";
import { IAdminRepository } from "../interface/admin/IAdminRepository";
import { IUserRespository } from "../interface/user/!UserRepository";
import { IHostResponse } from "../dtos/HostResponse";
import { IUserResponse } from "../dtos/UserResponse";
import { ICategoryResponse } from "../dtos/CategoryResponse";
import { IOtpVerify } from "../dtos/OtpVerify";
import { otpgenerator } from "../utils/otp";
import jwt from 'jsonwebtoken';
import { IHost } from "../model/hostModel";


class hostService implements IHostService {
    constructor(private _hostRepository: IHostRepository, private _walletRepository: IWalletRepository,
        private _adminRepository: IAdminRepository, private _userRepository: IUserRespository
    ) { }

    async signUp(hostData: IHostResponse): Promise<string> {
        try {
            const existingUser = await this._hostRepository.findHostByEmail(hostData.email);
            if (existingUser) {
                return Messages.Existing;
            }

            const otpCode = otpgenerator();
            sendOtp(hostData.email, otpCode);
            await this._userRepository.otpGenerating(hostData.email, otpCode);
            if (!hostData.password) {
                return Messages.InvalidPassword;
            }
            const hashedPassword = await HashedPassword.hashPassword(hostData.password);

            await this._hostRepository.insertHost({
                name: hostData.name,
                mobile: hostData.mobile,
                email: hostData.email,
                password: hashedPassword,
                temp: true,
                hostType: "local"
            })


            return Messages.OtpSentSuccess;


        } catch (error) {
            console.log(error)
            return error as string;
        }
    }

    async resendOtp(hostData: Partial<IHost>): Promise<string | null> {
        try {
            const Otp = otpgenerator();
            sendOtp(hostData.email!, Otp);
            await this._hostRepository.otpGenerating(hostData.email!, Otp);
            if (!hostData.password) {
                return Messages.InvalidPassword;
            }
            const hashedPassword = await HashedPassword.hashPassword(hostData.password);
            await this._hostRepository.insertHost({
                name: hostData.name,
                mobile: hostData.mobile,
                email: hostData.email,
                password: hashedPassword,
                temp: true,
                hostType: "local",
            })
            return Messages.OtpSuccess
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async verifyOtp(hostOtp: { email: string; otp: number }): Promise<string> {
        try {
            const host = await this._hostRepository.findOtpByEmail(hostOtp.email);
            if (!host) {
                return Messages.UserNotFound;
            }
            if (hostOtp.otp !== host.otp) {
                return Messages.InvalidOtp;
            }
            if (hostOtp.otp == host.otp) {
                const createUser = await this._hostRepository.createHost(hostOtp);
                if (createUser == Messages.success) {
                    await this._walletRepository.createWallet(hostOtp.email)
                }
            }
            return Messages.success;
        } catch (error) {
            return error as string
        }
    }

    async forgotPassword(hostData: { email: string }): Promise<IHostResponse | null> {
        try {
            const hostFind = await this._hostRepository.findHostByEmail(hostData.email);
            if (hostFind == null) {
                return null
            }
            const Otp = otpgenerator();
            sendOtp(hostData.email, Otp)
            await this._hostRepository.otpGenerating(hostData.email, Otp);
            return hostFind;
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }> {
        try {
            const changePassword = await this._hostRepository.resetPassword(hostData);
            return changePassword;
        } catch (error) {
            console.log(error);
            return { message: error as string };
        }
    }

    async verifyLogin(hostData: { email: string; password: string }): Promise<{
        message: string;
        accessToken?: string;
        refreshToken?: string;
        role?: string;
    }> {
        try {
            const checkhost = await this._hostRepository.findHostByEmail(hostData.email);

            if (!checkhost) {
                return { message: Messages.InvalidEmail };
            }

            if (checkhost.isBlock) {
                return { message: Messages.HostIsBlocked };
            }

            if (!checkhost.password) {
                return { message: Messages.InvalidPassword };
            }

            const isMatch = await bcrypt.compare(hostData.password, checkhost.password);

            if (!isMatch) {
                return { message: Messages.InvalidPassword };
            }

            const hostPayload = {
                _id: checkhost._id as Types.ObjectId,
                role: 'host' as const
            };

            const accessToken = generateAccessToken(hostPayload);
            const refreshToken = generateRefreshToken(hostPayload);

            return {
                message: Messages.Success,
                accessToken,
                refreshToken,
                role: 'host'
            };
        } catch (error) {
            return { message: error as string };
        }
    }




    async newHost(host_id: Types.ObjectId): Promise<string> {
        try {
            const getHostels = await this._hostRepository.getAllHostels();

            if (!Array.isArray(getHostels)) {
                return Messages.FetchHostelFail
            }

            host_id = new Types.ObjectId(host_id)

            const response = await this._hostRepository.newHost({ hostels: getHostels, host_id });
            return response
        } catch (error) {
            return error as string
        }
    }

    async approvalRequest(host_id: Types.ObjectId, photo: string | undefined, documentType: string): Promise<string> {
        try {
            const uploadDocument = await this._hostRepository.uploadDocument(host_id, photo, documentType)
            if (uploadDocument == Messages.DocumentUpdated) {
                const response = await this._hostRepository.approvalRequest(host_id);
                return response
            }
            return uploadDocument
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(id: Types.ObjectId): Promise<IHostResponse | string> {
        try {
            const projection = {
                name: 1,
                email: 1,
                mobile: 1
            }
            const host = await this._hostRepository.findHostById(id, projection);
            if (!host || typeof host === "string") {
                return Messages.HostNotFound;
            }

            const response: IHostResponse = {
                _id: (host._id as Types.ObjectId).toString(),
                name: host.name,
                email: host.email,
                mobile: host.mobile
            }
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string> {
        try {
            const decoded = verifyToken(refreshToken)
            if (decoded == null) {
                console.log("Token is expired")
            }

            if (typeof decoded == 'object' && decoded !== null) {
                const projection = {
                    _id: 1
                }
                const response = await this._hostRepository.findHostById(decoded._id, projection)

                if (!response || typeof response === 'string') {
                    return Messages.NoHosts;
                }

                const hostPayload: hostPayload = {
                    _id: response._id as Types.ObjectId,
                    role: 'host'
                }

                const accessToken = generateAccessToken(hostPayload);
                const refreshToken = generateRefreshToken(hostPayload)

                return { accessToken, refreshToken }
            }
            return Messages.InvalidToken
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllCategory(): Promise<ICategoryResponse[] | string> {
        try {
            const response = await this._hostRepository.getAllCategory();
            return response
        } catch (error) {
            return error as string
        }
    }

    async changePassword(hostData: { hostId: Types.ObjectId; currentPassword: string; newPassword: string }): Promise<string> {
        try {
            const response = await this._hostRepository.changePassword(hostData);
            return response
        } catch (error) {
            return error as string
        }
    }

    async editProfile(hostData: { hostId: Types.ObjectId, name: string, mobile: string }): Promise<string> {
        try {
            const response = await this._hostRepository.editProfile(hostData);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getAllUsers(): Promise<IUserResponse[] | string | null> {
        try {
            const response = await this._userRepository.getAllUsers();
            return response
        } catch (error) {
            return error as string
        }
    }

    async getAdmin(): Promise<IUserResponse | string | null> {
        try {
            const response = await this._adminRepository.getAdmin();
            return response;
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
            const checkUser = await this._hostRepository.findHostByEmail(payload.email)
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
            console.log(data, 'Data')
            const id = await this._hostRepository.createGoogleAuth(data)
            await this._walletRepository.createWallet(payload.email);
            console.log(id, 'HEyyyy')
            const userPayload = {
                _id: new Types.ObjectId(id),
                role: 'host' as const
            };
            console.log(userPayload, 'dlfsdf', id)
            const accessToken = generateAccessToken(userPayload);
            const refreshToken = generateRefreshToken(userPayload);
            console.log(Messages.UserCreated, accessToken, refreshToken)
            return { message: Messages.UserCreated, accessToken, refreshToken, role: 'host' }
        } catch (error) {
            return error as string
        }
    }
}

export default hostService