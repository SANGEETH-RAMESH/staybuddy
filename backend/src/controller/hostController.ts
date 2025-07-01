import { Request, Response } from "express";
import { IHostService } from "../interface/host/!HostService";
import uploadImage from "../cloudinary/cloudinary";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import { ObjectId } from "mongodb";
import { forgotPasswordValidation, otpValidation, resetPasswordValidation, signInValidation, signupValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";
import { StatusCode } from "../status/statusCode";

declare module "express" {
    interface Request {
        customHost?: hostPayload;
    }
}

class hostController {
    constructor(private hostService: IHostService) { }

    async SignUp(req: Request, res: Response): Promise<void> {
        try {
            let validationErrors: Record<string, string> = {};

            await signupValidation.validate(req.body.hostData, { abortEarly: false })
                .catch((error: ValidationError) => {
                    console.log('1')
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    })
                })

            if (Object.keys(validationErrors).length > 0) {
                console.log("2")
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }
            const { hostData } = req.body
            const response = await this.hostService.SignUp(hostData);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.resendOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async VerifyOtp(req: Request, res: Response): Promise<void> {
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


            const response = await this.hostService.verifyOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
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

            const existingHost = await this.hostService.forgotPassword(req.body);
            if (existingHost && existingHost.temp == false) {
                res.status(StatusCode.OK).json({ success: true, message: "Host found" })
            } else {
                res.status(StatusCode.OK).json({ success: true, message: "Host not found" })
            }
        } catch (error) {
            console.log(error)
        }
    }

    async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
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
            const response = await this.hostService.verifyOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)

        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            let validationErrors: Record<string, string> = {};

            await resetPasswordValidation
                .validate(
                    {
                        newPassword: req.body.password,
                        confirmPassword: req.body.confirmPassword
                    },
                    { abortEarly: false }
                )
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
                    errors: validationErrors
                });
                return;
            }
            const response = await this.hostService.resetPassword(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response.message })
        } catch (error) {
            console.log(error)
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
            const response = await this.hostService.verifyLogin(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response.message, accessToken: response.accessToken, refreshToken: response.refreshToken })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;

            if (!host?._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Id is missing or invalid' });
                return
            }
            console.log(host, 'hello')
            const response = await this.hostService.getHost(host._id);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async newHost(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            console.log(host, 'hsott')

            if (!host?._id) {
                res.json({ message: "No host id" })
                return
            }

            const response = await this.hostService.newHost(host?._id)
            console.log(response, 'ssss')
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async requestApproval(req: Request, res: Response): Promise<void> {
        try {
            console.log('hey')
            console.log(req.file)
            console.log(req.body.documentType, 'Body')
            const documentType = req.body.documentType;
            let photo: string | undefined = undefined;
            if (req.file && req.file.buffer) {
                photo = await uploadImage(req.file.buffer);
            }
            const host = req.customHost;
            console.log(host?._id)
            if (!host?._id) {
                res.json({ success: false, message: "Not host id" })
            }

            const hostId = new ObjectId(host?._id);
            const response = await this.hostService.approvalRequest(hostId, photo, documentType)
            res.status(StatusCode.OK).json({ success: true, message: response })

        } catch (error) {
            console.log(error)
        }
    }

    

    async hostGoogleSignUp(req: Request, res: Response): Promise<void> {
        try {
            const host = req.user;
            const hostData = { name: host?.displayName, email: host?.email };
            const response = await this.hostService.hostGoogleSignUp(hostData);
            if (typeof response !== 'string' && response?.message === 'Success') {
                res.redirect(`http://localhost:5173/host/home/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`)
            } else {

                res.json({ message: response });
            }

            console.log(hostData)
        } catch (error) {
            console.log(error)
        }
    }

    async validateRefreshToken(req: Request, res: Response): Promise<void> {
        try {

            const { refreshToken } = req.body;
            const response = await this.hostService.validateRefreshToken(refreshToken)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.getAllCategory();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost
            if (!host || !host._id) {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: "No Host" })
                return
            }
            const body = req.body.formData
            const data = { hostId: host._id, ...body }
            const response = await this.hostService.changePassword(data)
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "No Response" })
            }
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async editProfile(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            if (!host || !host._id) {
                res.status(StatusCode.BAD_REQUEST).json({ message: "No Host" })
                return
            }
            // console.log(req.body,"body")
            const data = { hostId: host._id, ...req.body }
            const response = await this.hostService.editProfile(data)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    // async walletDeposit(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { amount } = req.body;
    //         const id = req.customHost?._id?.toString();

    //         if (!id) {
    //             res.status(StatusCode.BAD_REQUEST).json({ message: "No Host" });
    //             return;
    //         }
    //         const data = { id, amount: String(amount) };
    //         const response = await this.hostService.walletDeposit(data)
    //         res.status(StatusCode.OK).json({ success: true, message: response })
    //     } catch (error) {
    //         res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
    //     }
    // }

    // async walletWithDraw(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { amount } = req.body;
    //         const id = req.customHost?._id?.toString();

    //         if (!id) {
    //             res.status(StatusCode.BAD_REQUEST).json({ message: "No Host" });
    //             return;
    //         }
    //         const data = { id, amount: String(amount) };
    //         const response = await this.hostService.walletWithDraw(data);
    //         res.status(StatusCode.OK).json({ message: response })
    //     } catch (error) {
    //         res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
    //     }
    // }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.getAllUsers();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getAdmin(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.getAdmin();
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    

    
}

export default hostController