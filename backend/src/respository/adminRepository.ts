
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

class adminRespository implements IAdminRepository {
    constructor() {

    }

    async FindAdminByEmail(email: string): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email, isAdmin: true })
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async AdminVerifyLogin(adminData: { admin_email: string, admin_password: string }): Promise<{ message: string; accessToken: string; refreshToken: string } | string> {
        try {
            const checkAdmin = await User.findOne({ email: adminData.admin_email, isAdmin: true });
            if (checkAdmin) {
                const isAdmin = await bcrypt.compare(adminData.admin_password, checkAdmin.password);
                if (isAdmin) {
                    const adminPayload: adminPayload = {
                        _id: checkAdmin._id as Types.ObjectId,
                        email: checkAdmin.email
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

    async getUser(): Promise<IUser[] | null> {
        try {
            const getUser = await User.find({ isAdmin: false });
            return getUser
        } catch (error) {
            console.log(error)
            return null
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

    async userDelete(userId: object): Promise<string> {
        try {
            console.log("hey")
            await User.findByIdAndDelete({ _id: userId })
            return "user deleted"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(): Promise<IHost[] | null> {
        try {
            const getHost = await Host.find();
            return getHost
        } catch (error) {
            console.log(error);
            return null
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

    async getAllHostels(): Promise<IHostel[] | string | null> {
        try {
            const findHostel = await Hostel.find().populate('host_id');
            // console.log(findHostel,'hostel')
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

    async getAllCategory(): Promise<ICategory[] | string> {
        try {
            const getCategories = await Category.find();
            return getCategories
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

    async getUserDetails(userId:string):Promise<string | IHost | null>{
        try {
            const getUserData = await Host.findOne({_id:userId});
            return getUserData;
        } catch (error) {
            return error as string
        }
    }

    async getHostHostelData(hostId:string): Promise<IHostel[] | string | null>{
        try {
            const findHostHostel = await Hostel.find({host_id:hostId});
            return findHostHostel;
        } catch (error) {
            return error as string
        }
    }
}


export default adminRespository