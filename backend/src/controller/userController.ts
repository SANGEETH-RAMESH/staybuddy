import { Request, Response } from "express";
import { IUserService } from "../interface/user/!UserService";
import mongoose from "mongoose";
import { forgotPasswordValidation, otpValidation, signInValidation, signupValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";
import { StatusCode } from "../status/statusCode";
const ObjectId = mongoose.Types.ObjectId;




class UserController {
    constructor(private userService: IUserService) { }

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
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }

            const response = await this.userService.userSignUp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.error("Error in userSignUp:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
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
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }

            const response = await this.userService.verifyOtp(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in verifyOtp:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
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
                    message: "Validation failed",
                    errors: validationErrors,
                });
                return;
            }
            const response = await this.userService.verifyLogin(req.body);
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
                    res.status(StatusCode.OK).json({ success: false, message: response.message });
                } else {
                    res.status(StatusCode.OK).json({ success: false, message: response });
                }
            } else {
                res.status(StatusCode.OK).json({ success: false, message: response });
            }
        } catch (error: any) {
            console.error("Error in verifyLogin:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.resendOtp(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in resendOtp:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
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
                    message: "Validation failed",
                    errors: validationErrors,
                });
                return;
            }
            const existingUser = await this.userService.forgotPassword(req.body);
            if (existingUser && existingUser.temp === false) {
                res.json({ success: true, message: "User found" });
            } else {
                res.json({ success: false, message: "User not found" });
            }
        } catch (error) {
            console.error("Error in forgotPassword:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.verifyOtp(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in verifyForgotPasswordOtp:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.resetPassword(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in resetPassword:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || !user._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "User ID is missing" });
                return;
            }
            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            const response = await this.userService.getUserDetails(id);
            if (!response) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            res.status(StatusCode.OK).json({ success: true, data: response });
        } catch (error) {
            console.error("Error in getUserDetails:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || !user._id) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const data = { ...req.body, userId: user._id };
            const response = await this.userService.changePassword(data);
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "Password change failed" });
                return;
            }

            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.error("Error in changePassword:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async editUserDetail(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || !user._id) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const data = { ...req.body, userId: user._id };
            const response = await this.userService.editUserDetail(data);
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "Failed to update user details" });
                return;
            }
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.error("Error in editUserDetail:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async googleSignUp(req: Request, res: Response): Promise<void> {
        try {

            const user = req.user
            const userData = { name: user?.displayName, email: user?.email };
            const response = await this.userService.googleSignUp(userData)
            if (typeof response !== 'string' && response?.message === 'Success') {
                res.redirect(`http://localhost:5173/user/home/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`)
            } else {
                res.json({ message: response });
            }
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }



    async validaterefreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body
            const response = await this.userService.validateRefreshToken(refreshToken)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.allHost();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async markAllRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this.userService.markAllRead(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }
}

export default UserController;
