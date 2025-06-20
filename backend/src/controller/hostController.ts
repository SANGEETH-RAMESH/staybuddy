import { Request, Response } from "express";
import { IHostService } from "../interface/host/!HostService";
import uploadImage from "../cloudinary/cloudinary";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import { ObjectId } from "mongodb";
import { forgotPasswordValidation, otpValidation, resetPasswordValidation, signInValidation, signupValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";

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
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }
            const { hostData } = req.body
            const response = await this.hostService.SignUp(hostData);
            res.json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.resendOtp(req.body);
            res.json({ success: true, message: response })
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
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }


            const response = await this.hostService.verifyOtp(req.body);
            res.status(200).json({ success: true, message: response })
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
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }

            const existingHost = await this.hostService.forgotPassword(req.body);
            if (existingHost && existingHost.temp == false) {
                res.status(200).json({ success: true, message: "Host found" })
            } else {
                res.status(200).json({ success: true, message: "Host not found" })
            }
        } catch (error) {
            console.log(error)
        }
    }

    async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body, 'body')
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
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                })
                return
            }
            const response = await this.hostService.verifyOtp(req.body);
            res.json({ success: true, message: response })
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
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                });
                return;
            }

            const response = await this.hostService.resetPassword(req.body);
            console.log(response, 'ss')
            res.json({ success: true, message: response.message })
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
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors,
                });
                return;
            }
            const response = await this.hostService.verifyLogin(req.body);
            res.status(200).json({ success: true, message: response.message, accessToken: response.accessToken, refreshToken: response.refreshToken })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Error processing the request' });
        }
    }

    async addHostel(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body, 'controller');

            let photo: string | undefined = undefined;
            //   console.log(req.file,'file')
            // Ensure req.file is not undefined
            if (req.file && req.file.buffer) {
                photo = await uploadImage(req.file.buffer);  // Only call uploadImage if the file is present
                // console.log(photo, 'photo');
            }

            console.log(req.body, 'body')

            const response = await this.hostService.addHostel({
                ...req.body,
                photo, // Add photo to the body, it will be undefined if no file was uploaded
            });

            res.status(200).json({ message: response });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error processing the request' });
        }
    }

    async getHostels(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost
            console.log(host, 'hello')
            const email = host?.email;
            if (!email) {
                res.status(404).json({ success: true, message: "No host" })
                return
            }
            const response = await this.hostService.getHostels(email);
            console.log(response, 'response')
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;

            if (!host?.email) {
                res.status(400).json({ success: false, message: 'Email is missing or invalid' });
                return
            }
            console.log(host, 'hello')
            // const hostId = new ObjectId(host._id)
            const response = await this.hostService.getHost(host._id);

            // console.log(response, 'responseeeee')
            res.status(200).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Server error' });
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
            res.status(200).json({ success: true, message: response })
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
            //   console.log(req.file,'file')
            // Ensure req.file is not undefined
            if (req.file && req.file.buffer) {
                photo = await uploadImage(req.file.buffer);  // Only call uploadImage if the file is present
                // console.log(photo, 'photo');
            }
            const host = req.customHost;
            console.log(host?._id)
            if (!host?._id) {
                res.json({ success: false, message: "Not host id" })
            }

            const hostId = new ObjectId(host?._id);
            const response = await this.hostService.approvalRequest(hostId, photo, documentType)
            res.status(200).json({ success: true, message: response })

        } catch (error) {
            console.log(error)
        }
    }

    async getOneHostel(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query.id, 'hello');
            const id = req.query.id as string;
            if (!id) {
                res.json({ success: false, message: "Hostel ID not provided" });
                return;
            }
            const objectId = new ObjectId(id);
            const response = await this.hostService.getOneHostel(objectId)
            console.log(response, "Response")
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async hostGoogleSignUp(req: Request, res: Response): Promise<void> {
        try {
            const host = req.user;
            // console.log(host)
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
            // console.log(refreshToken,'controllerrr')
            const response = await this.hostService.validateRefreshToken(refreshToken)
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.getAllCategory();
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async getWalletDetails(req: Request, res: Response): Promise<void> {
        try {
            console.log('heeeee')
            const host = req.customHost;
            if (!host?._id) {
                res.json({ success: false, message: "Not host id" })
                return
            }
            const hostId = host?._id.toString()
            const response = await this.hostService.getWalletDetails(hostId);
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            const hostId = req.params.id;
            const response = await this.hostService.getBookings(hostId)
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost
            if (!host || !host.email) {
                res.status(401).json({ success: false, message: "No Host" })
                return
            }
            const body = req.body.formData
            const data = { email: host.email, ...body }
            const response = await this.hostService.changePassword(data)
            if (!response) {
                res.status(400).json({ success: false, message: "No Response" })
            }
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    async editProfile(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            if (!host || !host.email) {
                res.status(400).json({ message: "No Host" })
                return
            }
            // console.log(req.body,"body")
            const data = { email: host.email, ...req.body }
            const response = await this.hostService.editProfile(data)
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    async walletDeposit(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            const id = req.customHost?._id?.toString();

            if (!id) {
                res.status(400).json({ message: "No Host" });
                return;
            }
            const data = { id, amount: String(amount) };
            const response = await this.hostService.walletDeposit(data)
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    async walletWithDraw(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            const id = req.customHost?._id?.toString();

            if (!id) {
                res.status(400).json({ message: "No Host" });
                return;
            }
            const data = { id, amount: String(amount) };
            const response = await this.hostService.walletWithDraw(data);
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.getAllUsers();
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    async getAdmin(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostService.getAdmin();
            res.status(200).json({ message: response });
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
}

export default hostController