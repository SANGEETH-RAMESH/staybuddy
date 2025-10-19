import { Request, Response } from "express";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";
import { IProfileService } from "../interface/user/!UserService";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

class ProfileController{

    constructor(private _profileService: IProfileService){}


    async getUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || !user._id) {
                // res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.UserIdMissing });
                return;
            }
            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            const response = await this._profileService.getUserDetails(id);
            if (!response) {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: Messages.UserNotFound });
                return;
            }
            res.status(StatusCode.OK).json({ success: true, data: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
            try {
                const user = req.user;
                if (!user || !user._id) {
                    res.status(401).json({ success: false, message: Messages.Unauthorized });
                    return;
                }
                const data = { ...req.body, userId: user._id };
                const response = await this._profileService.changePassword(data);
                if (!response) {
                    res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.PasswordChangeFailed });
                    return;
                }
    
                res.status(StatusCode.OK).json({ success: true, message: response });
            } catch (error) {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
            }
        }
    
        async editUserDetail(req: Request, res: Response): Promise<void> {
            try {
                console.log('Hmmmmmm')
                const user = req.user;
                if (!user || !user._id) {
                    res.status(401).json({ success: false, message: Messages.Unauthorized });
                    return;
                }
                const data = { ...req.body, userId: user._id };
                const response = await this._profileService.editUserDetail(data);
                if (!response) {
                    res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.FailedUpdateUserDetails });
                    return;
                }
                res.status(StatusCode.OK).json({ success: true, message: response });
            } catch (error) {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
            }
        }
} 

export default ProfileController;