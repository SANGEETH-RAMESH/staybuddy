import { ProjectionType, Types } from "mongoose";
import { IProfileRepository } from "../interface/user/!UserRepository";
import User, { IUser } from "../model/userModel";
import baseRepository from "./baseRespository";
import { Messages } from "../messages/messages";


class profileRepository extends baseRepository<IUser> implements IProfileRepository {

    constructor() {
        super(User)
    }


    async editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string> {
        try {
            const updatingUserDetails = await User.updateOne(
                { _id: userData.userId },
                {
                    $set: {
                        name: userData.name,
                        mobile: userData.mobile
                    }
                }
            )
            if (updatingUserDetails.matchedCount == 1) {
                return Messages.UserDetailsUpdated;
            } else {
                return Messages.NotUpdated;
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        try {

            const userData = await this.findByEmail({ email })
            if (!userData) return null;
            return userData;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findUserById(id: string | Types.ObjectId, projection?: ProjectionType<IUser>): Promise<IUser | null> {
        try {
            const userData = await this.findById(id, projection)
            if (!userData) return null;
            return userData;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
        try {
            const result = await User.updateOne(
                { _id: userId },
                { $set: { password: hashedPassword } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            return false;
        }
    }
}

export default profileRepository;