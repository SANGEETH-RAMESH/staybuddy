import { Request, Response } from "express";
import { IHostService } from "../interface/host/!HostService";
import uploadImage from "../cloudinary/cloudinary";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import { ObjectId } from "mongodb";
import { forgotPasswordValidation, otpValidation, resetPasswordValidation, signInValidation, signupValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";

declare module "express" {
    interface Request {
        customHost?: hostPayload;
    }
}

class hostController {
    constructor(private _hostService: IHostService) { }

    async signUp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.signUp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.resendOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.verifyOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const existingHost = await this._hostService.forgotPassword(req.body);
            if (existingHost && existingHost.temp == false) {
                res.status(StatusCode.OK).json({ success: true, message: Messages.HostFound })
            } else {
                res.status(StatusCode.OK).json({ success: true, message: Messages.NoHost })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.verifyOtp(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });

        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.resetPassword(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response.message })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyLogin(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.verifyLogin(req.body);
            res.status(StatusCode.OK).json({ success: true, message: response.message, accessToken: response.accessToken, refreshToken: response.refreshToken, role: response.role })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }



    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            if (!host?._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.IdMissing });
                return
            }
            const response = await this._hostService.getHost(host._id);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async newHost(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;

            if (!host?._id) {
                res.json({ message: Messages.NoHostId })
                return
            }

            const response = await this._hostService.newHost(host?._id)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async requestApproval(req: Request, res: Response): Promise<void> {
        try {
            const documentType = req.body.documentType;
            let photo: string | undefined = undefined;
            if (req.file && req.file.buffer) {
                photo = await uploadImage(req.file.buffer);
            }
            const host = req.customHost;
            if (!host?._id) {
                res.json({ success: false, message: Messages.NoHostId })
            }

            const hostId = new ObjectId(host?._id);
            const response = await this._hostService.approvalRequest(hostId, photo, documentType)
            res.status(StatusCode.OK).json({ success: true, message: response })

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async validateRefreshToken(req: Request, res: Response): Promise<void> {
        try {

            const { refreshToken } = req.body;
            const response = await this._hostService.validateRefreshToken(refreshToken)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.getAllCategory();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost
            if (!host || !host._id) {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: Messages.NoHost })
                return
            }
            const body = req.body.formData
            const data = { hostId: host._id, ...body }
            const response = await this._hostService.changePassword(data)
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.NoResponse })
            }
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async editProfile(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            if (!host || !host._id) {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.NoHost })
                return
            }
            const data = { hostId: host._id, ...req.body }
            const response = await this._hostService.editProfile(data)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.getAllUsers();
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getAdmin(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostService.getAdmin();
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async createGoogleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;
            const response = await this._hostService.createGoogleAuth(credential);
            res.status(StatusCode.OK).json(response)
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }




}

export default hostController