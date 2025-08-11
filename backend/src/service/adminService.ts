
import { IAdminService } from "../interface/admin/IAdminService";
import { IAdminRepository } from "../interface/admin/IAdminRepository";
import bcrypt from 'bcrypt';
import mongoose, { ObjectId, Types } from 'mongoose'
import { sendApprovalOrRejectionMail } from "../utils/mail";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../Jwt/jwt";
import { adminPayload } from "../types/commonInterfaces/tokenInterface";
import { IUserResponse } from "../dtos/UserResponse";
import { IUserRespository } from "../interface/user/!UserRepository";
import { IHostRepository } from "../interface/host/!HostRepository";
import { IHostResponse } from "../dtos/HostResponse";
import { Messages } from "../messages/messages";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import { IOrderRepository } from "../interface/order/!OrderRepository";
import { IUpdateHostelInput } from "../dtos/HostelData";
import { IOrderResponse } from "../dtos/OrderResponse";
import { reviewData } from "../dtos/ReviewData";


class adminService implements IAdminService {
    constructor(private _adminRepository: IAdminRepository, private _userRepository: IUserRespository,
    private _hostRepository: IHostRepository, private _hostelRepository:IHostelRepository,
    private _orderRepository:IOrderRepository
        
    ) {

    }

    async adminLogin(adminData: { email: string, password: string }): Promise<{
        message: string;
        accessToken?: string;
        refreshToken?: string;
        role?: string;
    }> {
        try {
            const checkingHost = await this._adminRepository.adminVerifyLogin(adminData.email);
            if (typeof checkingHost === 'string') {
                return { message: checkingHost };
            }

            if (!checkingHost || !checkingHost.password) {
                return { message: Messages.NoAdmin }
            }

            if (checkingHost.isBlock) {
                return { message: Messages.AdminIsBlocked };
            }

            const isMatch = await bcrypt.compare(adminData.password, checkingHost.password);
            if (!isMatch) {
                return { message: Messages.InvalidPassword }; 
            }

            const adminPayload = { 
                _id: checkingHost._id as Types.ObjectId,
                role: 'admin' as const
            };

            const accessToken = generateAccessToken(adminPayload);
            const refreshToken = generateRefreshToken(adminPayload);

            return {
                message: Messages.Success,
                accessToken,
                refreshToken,
                role: 'admin'
            };
        } catch (error) {
            console.log(error)
            return { message: error as string }
        }
    }

    async getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null> {
        try {
            const getUser = await this._userRepository.getUser(page, limit);
            return getUser
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async userBlock(userId: Types.ObjectId): Promise<string> {
        try {
            const response = await this._userRepository.userBlock(userId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUserResponse | null; error?: string }> {
        try {
            const response = await this._userRepository.userUnBlock(userId as Types.ObjectId);
            return response;
        } catch (error) {
            return {
                message: error as string,
                userUnBlock: null,
                error: String(error),
            };
        }
    }

    async userDelete(userId: Types.ObjectId): Promise<string> {
        try {
            const response = await this._userRepository.userDelete(userId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(skip: number, limit: number): Promise<{ hosts: IHostResponse[] | null; totalCount: number, hostIdCounts: Record<string, number> } | null> {
        try {
            const getHostels = await this._hostelRepository.getAllHostel();
            const getHost = await this._hostRepository.getHost(skip, limit);

            if (!Array.isArray(getHostels)) {
                return null;
            }

            const hostIdCounts: Record<string, number> = {};
            getHostels.forEach((hostel: IUpdateHostelInput) => {
                const hostId = typeof hostel.host_id === 'string'
                    ? hostel.host_id
                    : hostel.host_id?._id?.toString();

                if (hostId) {
                    hostIdCounts[hostId] = (hostIdCounts[hostId] || 0) + 1;
                }
            });

            return {
                hosts: getHost?.hosts ?? null,
                totalCount: getHost?.totalCount ?? 0,
                hostIdCounts
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async hostBlock(hostId: Types.ObjectId): Promise<string> {
        try {
            const response = await this._hostRepository.hostBlock(hostId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async hostUnBlock(hostId: Types.ObjectId): Promise<string> {
        try {
            const response = await this._hostRepository.hostUnBlock(hostId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async hostDelete(hostId: Types.ObjectId): Promise<string> {
        try {
            const hostDelete = await this._hostRepository.hostDelete(hostId);
            return hostDelete
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async approveHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {

            const approveHost = await this._hostRepository.approveHost(hostId);
            if (approveHost == Messages.Approved) {
                const projection = {
                    email: 1,
                }
                const Host = await this._hostRepository.findHostById(hostId,projection);
                if (typeof Host !== "string" && Host?.email) {
                    sendApprovalOrRejectionMail(Host.email, true);
                }
            }
            return approveHost
        } catch (error) {
            return error as string
        }
    }

    async rejectHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {
            const rejectHost = await this._hostRepository.rejectHost(hostId)
            if (rejectHost == Messages.Reject) {
                const Host = await this._hostRepository.findHostById(hostId);
                if (typeof Host !== "string" && Host?.email) {
                    sendApprovalOrRejectionMail(Host.email, false);
                }
            }
            return rejectHost
        } catch (error) {
            return error as string
        }
    }

    async getAllHostels(page: string, limit: string): Promise<{ hostels: IUpdateHostelInput[], totalCount: number; } | string | null> {
        try {
            const response = await this._hostelRepository.getAllHostels(page, limit);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHostDetails(userId: string): Promise<string | IHostResponse | null> {
        try {
            const response = await this._hostRepository.getHostDetails(userId)
            return response;
        } catch (error) {
            return error as string
        }
    }

    async getHostHostelData(userId: string): Promise<IUpdateHostelInput[] | string | null> {
        try {
            const response = await this._hostRepository.getHostHostelData(userId);
            return response
        } catch (error) {
            return error as string
            console.log(error)
        }
    }

    async deleteHostel(hostelId: string): Promise<string> {
        try {
            const response = await this._hostelRepository.deleteHostel(hostelId)
            return response
        } catch (error) {
            return error as string
        }
    }

    

    async searchUser(name: string): Promise<IUserResponse[] | string> {
        try {
            const response = await this._userRepository.searchUser(name);
            return response
        } catch (error) {
            return error as string
        }
    }

    async searchHost(name: string): Promise<IHostResponse[] | string | null> {
        try {
            const response = await this._hostRepository.searchHost(name);
            return response
        } catch (error) {
            return error as string
        }
    }

    async searchHostel(name: string): Promise<IUpdateHostelInput[] | string | null> {
        try {
            const response = await this._hostelRepository.searchHostel(name);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getReviews(hostelId: string): Promise<reviewData[] | string | null> {
        try {
            const response = await this._adminRepository.getReviews(hostelId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getSales(): Promise<IOrderResponse[] | string | null> {
        try {
            const response = await this._orderRepository.getSales();
            return response;
        } catch (error) {
            return error as string
        }
    }

    async validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string> {
        try {
            const decoded = verifyToken(refreshToken)
            if (typeof decoded === 'object' && decoded !== null) {
                const response = await this._adminRepository.findAdminById(decoded._id);
                if (!response || typeof response === 'string') {
                    return Messages.NoUser;
                }
                const adminPayload: adminPayload = {
                    _id: new Types.ObjectId(response._id),
                    role: 'admin'
                }

                const accessToken = generateAccessToken(adminPayload);
                const refreshToken = generateRefreshToken(adminPayload);

                return { accessToken, refreshToken };
            }

            return Messages.InvalidToken;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }
}

export default adminService