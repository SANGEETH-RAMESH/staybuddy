
import { IAdminRepository } from "../interface/admin/IAdminRepository";
import User, { IUser } from "../model/userModel";
import bcrypt from 'bcrypt';

import mongoose, { Types } from "mongoose";
// import generateToken from "../Jwt/jwt";
import { generateAccessToken, generateRefreshToken } from "../Jwt/jwt";
import { ObjectId } from 'mongoose';
import { adminPayload } from "../types/commonInterfaces/tokenInterface";
import Host, { IHost } from "../model/hostModel";
import Hostel, { IHostel } from "../model/hostelModel";
import Category, { ICategory } from "../model/categoryModel";
import baseRepository from "./baseRespository";
import Review, { IReview } from "../model/reviewModel";
import Order, { IOrder } from "../model/orderModel";
import { IUserResponse } from "../dtos/UserResponse";

class adminRespository extends baseRepository<IUser> implements IAdminRepository {
    constructor() {
        super(User)
    }

    async FindAdminByEmail(email: string): Promise<IUserResponse | null> {
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
            const admin = await this.findByEmail({ email, isAdmin: true },projection)
            return admin
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async AdminVerifyLogin(adminData: { email: string, password: string }): Promise<{ message: string; accessToken: string; refreshToken: string } | string> {
        try {
            const checkAdmin = await User.findOne({ email: adminData.email, isAdmin: true });
            if (checkAdmin) {
                const isAdmin = await bcrypt.compare(adminData.password, checkAdmin.password);
                if (isAdmin) {
                    const adminPayload: adminPayload = {
                        _id: checkAdmin._id as Types.ObjectId,
                       role:'admin'
                    }
                    const accessToken = generateAccessToken(adminPayload);
                    const refreshToken = generateRefreshToken(adminPayload)
                    return { message: "Success", accessToken, refreshToken }
                } else {
                    return 'Invalid Password'
                }
            } else {
                return "Invalid Email"
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getUser(page: number, limit: number): Promise<{ users: IUserResponse[]; totalCount: number } | string | null> {
        try {
            const skipCount = (page - 1) * limit;

            const projection ={
                _id:1,
                name:1,
                mobile:1,
                isAdmin:1,
                isBlock:1,
                email:1
            }

            const users = await User.find({ isAdmin: false },projection)
                .skip(skipCount)
                .limit(limit);

            const totalCount = await User.countDocuments({ isAdmin: false });

            return { users, totalCount };
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async userBlock(userId: ObjectId): Promise<string> {
        try {
            await User.updateOne(
                { _id: userId },
                { $set: { isBlock: true } }
            )
            return "User blocked"
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
            return { message: "unblocked", userUnBlock: data };
        } catch (error) {
            console.error("Error unblocking user:", error);
            return { message: "Failed to unblock the user.", userUnBlock: null, error: String(error) };
        }
    }

    async userDelete(userId: Types.ObjectId): Promise<string> {
        try {
            console.log("hey")
            await this.deleteById(userId)
            return "user deleted"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(skip: number, limit: number): Promise<{ hosts: IHost[]; totalCount: number } | null> {
        try {
            const hosts = await Host.find().skip(skip).limit(limit)
            const totalCount = await Host.countDocuments()

            return { hosts, totalCount };
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async hostBlock(hostId: ObjectId): Promise<string> {
        try {
            await Host.updateOne(
                { _id: hostId },
                { $set: { isBlock: true } }
            )
            return 'blocked'
        } catch (error) {
            return error as string
        }
    }

    async hostUnBlock(hostId: ObjectId): Promise<string> {
        try {
            await Host.updateOne(
                { _id: hostId },
                { $set: { isBlock: false } }
            )
            return 'unblocked'
        } catch (error) {
            return error as string
        }
    }

    async hostDelete(hostId: Types.ObjectId): Promise<string> {
        try {
            await Host.findByIdAndDelete(hostId);
            return 'host deleted'
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async approveHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {
            const result = await Host.findByIdAndUpdate(
                { _id: hostId },
                { $set: { approvalRequest: 3 } },
                { new: true }
            )
            if (result) {
                return 'Approved'
            } else {
                return "Not Approved"
            }
        } catch (error) {
            return error as string
        }
    }

    async rejectHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {
            console.log("iddd", hostId)
            const result = await Host.findByIdAndUpdate(
                { _id: hostId },
                { $set: { approvalRequest: 1 } },
                { new: true }
            )
            if (result) {
                return "Reject"
            }
            return "Not Reject"
        } catch (error) {
            return error as string
        }
    }

    async findHostById(id: mongoose.Types.ObjectId): Promise<IHost | null | string> {
        try {
            const host = await Host.findOne(id);
            return host;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getAllHostels(page: string, limit: string): Promise<{ hostels: IHostel[], totalCount: number; } | string | null> {
        try {
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            const hostels = await Hostel.find()
                .skip(limitNumber * (pageNumber - 1))
                .limit(limitNumber)
                .populate('host_id');

            const totalCount = await Hostel.countDocuments();

            return { hostels, totalCount };
        } catch (error) {
            return error as string;
        }
    }

    async getHostels(): Promise<IHostel[] | string | null> {
        try {

            const findHostel = await Hostel.find().populate('host_id');
            if (findHostel.length == 0) {
                return "Not hostel"
            }
            return findHostel
        } catch (error) {
            return error as string
        }
    }

    async addCategory(name: string, isActive: boolean, photo: string | undefined): Promise<string> {
        try {
            const addingCategory = new Category({
                name: name,
                isActive: isActive,
                image: photo
            })
            await addingCategory.save()
            return "Added"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllCategory(skip: number, limit: number): Promise<{ getCategories: ICategory[], totalCount: number } | string> {
        try {
            const getCategories = await Category.find().skip(skip).limit(limit);
            const totalCount = await Category.countDocuments();
            return { getCategories, totalCount }
        } catch (error) {
            return error as string
        }
    }

    async findCategoryByName(name: string): Promise<string> {
        try {
            const lowerName = name.toLowerCase()
            const allCategories = await Category.find();
            const foundCategory = allCategories.find(
                (category) => category.name.toLowerCase() == lowerName
            );
            console.log("FOund", foundCategory)
            if (foundCategory) {
                return "Category Already Exist";
            } else {
                return "Category not exist"
            }
        } catch (error) {
            return error as string
        }
    }

    async getCategory(id: string): Promise<ICategory | string> {
        try {
            const getCategory = await Category.findOne({ _id: id })
            if (!getCategory) {
                return "Category Not Found"
            }
            return getCategory
        } catch (error) {
            return error as string
        }
    }

    async updateCategory(id: string, name: string, isActive: boolean): Promise<string> {
        try {
            const updatingCategory = await Category.findOneAndUpdate(
                { _id: id },
                { $set: { name: name, isActive: isActive } },
                { new: true }
            )

            if (!updatingCategory) {
                return 'Category not updated';
            }
            return "Category Updated"
        } catch (error) {
            return error as string
        }
    }

    async getUserDetails(userId: string): Promise<string | IHost | null> {
        try {
            const getUserData = await Host.findOne({ _id: userId });
            return getUserData;
        } catch (error) {
            return error as string
        }
    }

    async getHostHostelData(hostId: string): Promise<IHostel[] | string | null> {
        try {
            const findHostHostel = await Hostel.find({ host_id: hostId });
            return findHostHostel;
        } catch (error) {
            return error as string
        }
    }

    async deleteHostel(hostelId: string): Promise<string> {
        try {
            const hostRemoving = await Hostel.findOneAndDelete(
                { _id: hostelId }
            )
            if (hostRemoving) {
                return "Hostel Deleted"
            }
            return "Hostel Not Deleted"
        } catch (error) {
            return error as string
        }
    }

    async deleteCategory(id: string): Promise<string | null> {
        try {
            console.log("ID", id)
            const deleting = await Category.findOneAndDelete({ _id: id })
            if (deleting) {
                return "Category Deleted"
            }
            return "Category Not deleted"
        } catch (error) {
            return error as string
        }
    }

    async searchCategory(name: string): Promise<ICategory[] | string | null> {
        try {
            const response = await Category.find({
                name: { $regex: `^${name}`, $options: 'i' }
            });
            return response;
        } catch (error) {
            return error as string;
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

    async searchHost(name: string): Promise<IHost[] | string | null> {
        try {
            const hosts = await Host.find({
                name: { $regex: `^${name}`, $options: 'i' }
            });
            return hosts
        } catch (error) {
            return error as string
        }
    }

    async searchHostel(name: string): Promise<IHostel[] | string | null> {
        try {
            const hostels = await Hostel.find({
                hostelname: { $regex: `^${name}`, $options: 'i' }
            }).populate('host_id')
            return hostels
        } catch (error) {
            return error as string
        }
    }

    async getReviews(hostelId: string): Promise<IReview[] | string | null> {
        try {
            const reviews = await Review.find({ hostelId: hostelId })
                .populate('userId')
            return reviews
        } catch (error) {
            return error as string
        }
    }

    async getSales(): Promise<IOrder[] | string | null> {
        try {
            const response = await Order.find();
            return response;
        } catch (error) {
            return error as string
        }
    }

}


export default adminRespository