import { Request, Response } from "express";
import { IUserService } from "../interface/user/!UserService";
import mongoose from "mongoose";
import { forgotPasswordValidation, otpValidation, signInValidation, signupValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";
import { StatusCode } from "../status/statusCode";
import { profileUpdateValidation } from "../validations/profileUpdateValidation ";
import { Messages } from "../messages/messages";
const ObjectId = mongoose.Types.ObjectId;




class UserController {
    constructor(private _userService: IUserService) { }

    async userSignUp(req: Request, res: Response): Promise<void> {
        try {
            let validationErrors: Record<string, string> = {};
            await signupValidation.validate(req.body, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    })
                })

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors
                })
                return
            }

            const response = await this._userService.userSignUp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {


            let validationErrors: Record<string, string> = {};

            await otpValidation.validate(req.body, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    })
                })

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors
                })
                return
            }

            const response = await this._userService.verifyOtp(req.body);
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
            let validationErrors: Record<string, string> = {};
            await signInValidation.validate(req.body, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    });
                });

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors,
                });
                return;
            }
            const response = await this._userService.verifyLogin(req.body);
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
            const response = await this._userService.resendOtp(req.body);
            res.status(StatusCode.UNAUTHORIZED).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            let validationErrors: Record<string, string> = {};
            await forgotPasswordValidation.validate(req.body, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    });
                });

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors,
                });
                return;
            }
            const existingUser = await this._userService.forgotPassword(req.body);
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
            const response = await this._userService.verifyOtp(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._userService.resetPassword(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || !user._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.UserIdMissing });
                return;
            }
            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            const response = await this._userService.getUserDetails(id);
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
            const response = await this._userService.changePassword(data);
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
            let validationErrors: Record<string, string> = {};
            await profileUpdateValidation.validate(req.body, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    })
                })

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors
                })
                return
            }
            const user = req.user;
            if (!user || !user._id) {
                res.status(401).json({ success: false, message: Messages.Unauthorized });
                return;
            }
            const data = { ...req.body, userId: user._id };
            const response = await this._userService.editUserDetail(data);
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.FailedUpdateUserDetails });
                return;
            }
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async validaterefreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body
            const response = await this._userService.validateRefreshToken(refreshToken)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._userService.allHost();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async markAllRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this._userService.markAllRead(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async createGoogleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;
            const response = await this._userService.createGoogleAuth(credential);
            res.status(StatusCode.OK).json(response)
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }


}

export default UserController;
