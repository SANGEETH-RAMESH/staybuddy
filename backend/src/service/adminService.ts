
import { IAdminService } from "../interface/admin/IAdminService";
import { IAdminRepository } from "../interface/admin/IAdminRepository";
import bcrypt from 'bcrypt';
import { IUser } from "../model/userModel";
import mongoose, { ObjectId, Types } from 'mongoose'
import { IHost } from "../model/hostModel";
import { sendApprovalOrRejectionMail } from "../utils/mail";
import { IHostel } from "../model/hostelModel";
import { ICategory } from "../model/categoryModel";
import { IReview } from "../model/reviewModel";
import { IOrder } from "../model/orderModel";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../Jwt/jwt";
import { adminPayload } from "../types/commonInterfaces/tokenInterface";
import { IUserResponse } from "../dtos/UserResponse";
import { IUserRespository } from "../interface/user/!UserRepository";
import { IHostRepository } from "../interface/host/!HostRepository";
import { IHostResponse } from "../dtos/HostResponse";


class adminService implements IAdminService {
    constructor(private adminRepository: IAdminRepository, private userRepository: IUserRespository, private hostRepository: IHostRepository) {

    }

    async adminLogin(adminData: { email: string, password: string }): Promise<{ message: string;
        accessToken?: string;
        refreshToken?: string;
        role?: string;} > {
        try {
            const checkingHost = await this.adminRepository.AdminVerifyLogin(adminData.email);
            if (typeof checkingHost === 'string') {
                return { message: checkingHost };
            }

            if(!checkingHost){
                return {message:"No Admin"}
            }

            if (checkingHost.isBlock) {
                return { message: "Admin is blocked" };
            }

            const isMatch = await bcrypt.compare(adminData.password, checkingHost.password);
            if (!isMatch) {
                return { message: "Invalid password" };
            }

            const adminPayload = {
                _id: checkingHost._id as Types.ObjectId,
                role: 'admin' as const
            };

            const accessToken = generateAccessToken(adminPayload);
            const refreshToken = generateRefreshToken(adminPayload);

            return {
                message: "Success",
                accessToken,
                refreshToken,
                role: 'admin'
            };
        } catch (error) {
            console.log(error)
            return { message:error as string}
        }
    }

    async getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null> {
        try {
            const getUser = await this.userRepository.getUser(page, limit);
            return getUser
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async userBlock(userId: Types.ObjectId): Promise<string> {
        try {
            const response = await this.adminRepository.userBlock(userId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async userUnBlock(userId: Types.ObjectId): Promise<{ message: string; userUnBlock: IUser | null; error?: string }> {
        try {
            const response = await this.adminRepository.userUnBlock(userId as Types.ObjectId);
            return response;
        } catch (error) {
            return {
                message: "An error occurred while unblocking the user",
                userUnBlock: null,
                error: String(error),
            };
        }
    }

    async userDelete(userId: Types.ObjectId): Promise<string> {
        try {
            const response = await this.adminRepository.userDelete(userId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(skip: number, limit: number): Promise<{ hosts: IHostResponse[] | null; totalCount: number, hostIdCounts: Record<string, number> } | null> {
        try {
            const getHostels = await this.adminRepository.getHostels();
            const getHost = await this.hostRepository.getHost(skip, limit);

            if (!Array.isArray(getHostels)) {
                console.error("Invalid data format: getHostels is not an array.");
                return null;
            }

            const hostIdCounts: Record<string, number> = {};
            getHostels.forEach((hostel: IHostel) => {
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
            const response = await this.adminRepository.hostBlock(hostId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async hostUnBlock(hostId: Types.ObjectId): Promise<string> {
        try {
            const response = await this.adminRepository.hostUnBlock(hostId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async hostDelete(hostId: Types.ObjectId): Promise<string> {
        try {
            const hostDelete = await this.adminRepository.hostDelete(hostId);
            return hostDelete
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async approveHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {

            const approveHost = await this.adminRepository.approveHost(hostId);
            if (approveHost == "Approved") {
                const Host = await this.adminRepository.findHostById(hostId);
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
            const rejectHost = await this.adminRepository.rejectHost(hostId)
            if (rejectHost == 'Reject') {
                const Host = await this.adminRepository.findHostById(hostId);
                if (typeof Host !== "string" && Host?.email) {
                    sendApprovalOrRejectionMail(Host.email, false);
                }
            }
            return rejectHost
        } catch (error) {
            return error as string
        }
    }

    async getAllHostels(page: string, limit: string): Promise<{ hostels: IHostel[], totalCount: number; } | string | null> {
        try {
            const response = await this.adminRepository.getAllHostels(page, limit);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async addCategory(name: string, isActive: boolean, photo: string | undefined): Promise<string> {
        try {

            const alreadyCategory = await this.adminRepository.findCategoryByName(name);
            if (alreadyCategory == 'Category Already Exist') {
                return "Category Already Exist"
            }
            const response = await this.adminRepository.addCategory(name, isActive, photo)
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllCategory(skip: number, limit: number): Promise<{ getCategories: ICategory[], totalCount: number } | string> {
        try {
            const response = await this.adminRepository.getAllCategory(skip, limit);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getCategory(id: string): Promise<ICategory | string> {
        try {
            const response = await this.adminRepository.getCategory(id)
            return response
        } catch (error) {
            return error as string
        }
    }

    async updateCategory(id: string, name: string, isActive: boolean): Promise<string> {
        try {
            const response = await this.adminRepository.updateCategory(id, name, isActive);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getHostDetails(userId: string): Promise<string | IHostResponse | null> {
        try {
            const response = await this.adminRepository.getHostDetails(userId)
            return response;
        } catch (error) {
            return error as string
        }
    }

    async getHostHostelData(userId: string): Promise<IHostel[] | string | null> {
        try {
            const response = await this.adminRepository.getHostHostelData(userId);
            return response
        } catch (error) {
            return error as string
            console.log(error)
        }
    }

    async deleteHostel(hostelId: string): Promise<string> {
        try {
            const response = await this.adminRepository.deleteHostel(hostelId)
            return response
        } catch (error) {
            return error as string
        }
    }

    async deleteCategory(id: string): Promise<string | null> {
        try {
            const response = await this.adminRepository.deleteCategory(id);
            return response
        } catch (error) {
            return error as string
        }
    }

    async searchCategory(name: string): Promise<ICategory[] | string | null> {
        try {
            const response = await this.adminRepository.searchCategory(name);
            return response;
        } catch (error) {
            return error as string;
        }
    }

    async searchUser(name: string): Promise<IUser[] | string> {
        try {
            const response = await this.adminRepository.searchUser(name);
            return response
        } catch (error) {
            return error as string
        }
    }

    async searchHost(name: string): Promise<IHost[] | string | null> {
        try {
            const response = await this.adminRepository.searchHost(name);
            return response
        } catch (error) {
            return error as string
        }
    }

    async searchHostel(name: string): Promise<IHostel[] | string | null> {
        try {
            const response = await this.adminRepository.searchHostel(name);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getReviews(hostelId: string): Promise<IReview[] | string | null> {
        try {
            const response = await this.adminRepository.getReviews(hostelId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getSales(): Promise<IOrder[] | string | null> {
        try {
            const response = await this.adminRepository.getSales();
            return response;
        } catch (error) {
            return error as string
        }
    }

    async validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string> {
        try {
            const decoded = verifyToken(refreshToken)
            if (typeof decoded === 'object' && decoded !== null) {
                const response = await this.adminRepository.FindAdminById(decoded._id);
                if (!response || typeof response === 'string') {
                    return "No User";
                }
                const adminPayload: adminPayload = {
                    _id: new Types.ObjectId(response._id),
                    role: 'admin'
                }

                const accessToken = generateAccessToken(adminPayload);
                const refreshToken = generateRefreshToken(adminPayload);

                return { accessToken, refreshToken };
            }

            return "Invalid Token";
        } catch (error) {
            console.log(error)
            return error as string
        }
    }
}

export default adminService