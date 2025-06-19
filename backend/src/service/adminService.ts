
import { IAdminService } from "../interface/admin/IAdminService";
import { IAdminRepository } from "../interface/admin/IAdminRepository";
// import HashedPassword from "../utils/hashedPassword";
// import bcrypt from 'bcrypt'
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


class adminService implements IAdminService {
    constructor(private adminRepository: IAdminRepository) {

    }

    async adminLogin(adminData: { email: string, password: string }): Promise<{ message: string; accessToken: string; refreshToken: string } | string> {
        try {
            const response = await this.adminRepository.AdminVerifyLogin(adminData)
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getUser(page: number, limit: number): Promise<{ users: IUser[]; totalCount: number } | string | null> {
        try {
            const getUser = await this.adminRepository.getUser(page, limit);
            return getUser
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async userBlock(userId: ObjectId): Promise<string> {
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
            console.log("sfdfsd")
            const response = await this.adminRepository.userDelete(userId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(skip: number, limit: number): Promise<{ hosts: IHost[] | null; totalCount: number, hostIdCounts: Record<string, number> } | null> {
        try {
            const getHostels = await this.adminRepository.getHostels();
            const getHost = await this.adminRepository.getHost(skip, limit);

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

    async hostBlock(hostId: ObjectId): Promise<string> {
        try {
            const response = await this.adminRepository.hostBlock(hostId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async hostUnBlock(hostId: ObjectId): Promise<string> {
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
            console.log(rejectHost)
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

    async getUserDetails(userId: string): Promise<string | IHost | null> {
        try {
            const response = await this.adminRepository.getUserDetails(userId)
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
            if (typeof decoded === 'object' && decoded !== null && 'email' in decoded) {
                const response = await this.adminRepository.FindAdminByEmail(decoded.email);
                if (!response) {
                    return "No User";
                }
                const adminPayload: adminPayload = {
                    _id: new Types.ObjectId(response._id),
                    name: response.name,
                    email: response.email,
                    mobile: response.mobile
                }

                const accessToken = generateAccessToken(adminPayload);
                const newRefreshToken = generateRefreshToken(adminPayload);

                return { accessToken, refreshToken: newRefreshToken };
            }

            return "Invalid Token";
        } catch (error) {
            console.log(error)
            return error as string
        }
    }
}

export default adminService