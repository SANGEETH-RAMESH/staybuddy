
import { IAdminRepository } from "../interface/admin/IAdminRepository";
import User, { IUser } from "../model/userModel";
import  { Types } from "mongoose";
import baseRepository from "./baseRespository";
import Review, { IReview } from "../model/reviewModel";
import { IUserResponse } from "../dtos/UserResponse";
import { Messages } from "../messages/messages";
import { reviewData } from "../dtos/ReviewData";

class adminRespository extends baseRepository<IUser> implements IAdminRepository {
    constructor() {
        super(User)
    }

    async findAdminByEmail(email: string): Promise<IUserResponse | null> {
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
            const admin = await this.findByEmail({ email, isAdmin: true }, projection)
            return admin
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findAdminById(id: Types.ObjectId): Promise<IUserResponse | null | string> {
        try {
            return await this.findById(id);
        } catch (error) {
            return error as string;
        }
    }

    async adminVerifyLogin(email: string): Promise<IUserResponse | string> {
        try {
            const projection = {
                _id: 1,
                name: 1,
                password: 1,
                email: 1,
                isBlock: 1
            }
            const admin = await User.findOne({ email, isAdmin: true }, projection);

            if (!admin) {
                return Messages.AdminNotFound;
            }

            return admin;
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async getReviews(hostelId: string): Promise<reviewData[] | string | null> {
        try {
            const reviews = await Review.find({ hostelId: hostelId })
                .populate('userId').lean<reviewData[]>();
            return reviews
        } catch (error) {
            return error as string
        }
    }

    async getAdmin(): Promise<IUser | string | null> {
        try {
            const admin = await User.findOne({ isAdmin: true })
            return admin;
        } catch (error) {
            return error as string
        }
    }
}


export default adminRespository