import { Types } from "mongoose";
import { IProfileService } from "../interface/user/!UserService";
import { Messages } from "../messages/messages";
import { IProfileRepository } from "../interface/user/!UserRepository";
import { UserDto } from "../dto/response/userdto";
import bcrypt from 'bcrypt';


class ProfileService implements IProfileService {
    constructor(private _profileRepository:IProfileRepository){}

    async existingUser(email: string): Promise<string> {
        try {


            const response = await this._profileRepository.findUserByEmail(email);
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
            const user = await this._profileRepository.findUserById(userId);
            if (!user) return null;
            return UserDto.from(user)
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async changePassword(userData: { userId: string; currentPassword: string; newPassword: string }): Promise<string> {
        try {
            const user = await this._profileRepository.findUserById(userData.userId);
            if (!user) return Messages.UserNotFound;

            const isCurrentMatch = await bcrypt.compare(userData.currentPassword, user.password);
            if (!isCurrentMatch) return Messages.CurrentPasswordDoesNotMatch;

            const isSamePassword = await bcrypt.compare(userData.newPassword, user.password);
            if (isSamePassword) return Messages.NewPasswordCannotbeSame;

            const hashed = await bcrypt.hash(userData.newPassword, 10);
            const updated = await this._profileRepository.updatePassword(userData.userId, hashed);

            return updated ? Messages.PasswordChangedSuccess : Messages.PasswordNotUpdated;
        } catch (error) {
            console.error(error);
            return error as string
        }
    }

    async editUserDetail(userData: { userId: Types.ObjectId, name: string, mobile: string }): Promise<string> {
        try {
            const response = await this._profileRepository.editUserDetail(userData);
            return response;
        } catch (error) {
            console.error(error);
            return error as string;
        }
    }
}

export default ProfileService;