import { Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";
import { IAuthService, IHostService, INotificationService, IProfileService } from "../interface/user/!UserService";
const ObjectId = mongoose.Types.ObjectId;




class UserController {
    constructor( private _authService: IAuthService,
        private _notificationService: INotificationService,
        private _hostService: IHostService) { }

    async userSignUp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._authService.userSignUp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._authService.verifyOtp(req.body);
            if (response == Messages.InvalidOtp) {
                res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: response });
            } else if (response == Messages.OtpExpired) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: response })
            } else {
                res.status(StatusCode.OK).json({ success: true, message: response });
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyLogin(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._authService.verifyLogin(req.body);
            if (typeof response === 'object' && response !== null) {
                if (response.message === "Success") {
                    res.status(StatusCode.OK).json({
                        message: {
                            success: true,
                            message: response.message,
                            accessToken: response.accessToken,
                            refreshToken: response.refreshToken,
                            role: response.role
                        }
                    });
                } else if (response.message === "user is blocked") {
                    res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: response.message });
                } else {
                    res.status(StatusCode.BAD_REQUEST).json({ success: false, message: response });
                }
            } else {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: response });
            }
        } catch (error: any) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._authService.resendOtp(req.body);
            res.status(StatusCode.UNAUTHORIZED).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const existingUser = await this._authService.forgotPassword(req.body);
            if (existingUser && existingUser.temp === false) {
                res.status(StatusCode.OK).json({ success: true, message: Messages.UserFound });
            } else {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: Messages.UserNotFound });
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._authService.verifyOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { newPassword, confirmPassword } = req.body;
            const response = await this._authService.resetPassword(req.body);
            console.log(response, "Respons")
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async validaterefreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body
            const response = await this._authService.validateRefreshToken(refreshToken)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.allHost();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async markAllRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this._notificationService.markAllRead(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async createGoogleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;
            const response = await this._authService.createGoogleAuth(credential);
            res.status(StatusCode.OK).json(response)
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }


}

export default UserController;
