
import { Request, Response } from "express";
import { IAdminService } from "../interface/admin/IAdminService";
import mongoose, { Types } from "mongoose";
import uploadImage from "../cloudinary/cloudinary";
import { signInValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";
import { categoryValidation } from "../validations/categoryValidation";
import { StatusCode } from '../status/statusCode'
import { Messages } from "../messages/messages";

class adminController {
    constructor(private _adminService: IAdminService) {

    }

    async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._adminService.adminLogin(req.body);
            if (response.message == Messages.AdminNotFound) {
                res.status(StatusCode.NOT_FOUND).json({ success: true, data: response });
                return;
            } else if (response.message == Messages.InvalidPassword) {
                res.status(StatusCode.UNAUTHORIZED).json({ success: true, data: response });
                return;
            }
            res.status(StatusCode.OK).json({ success: true, data: response })

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const pageNumber = parseInt(req.query.page as string) || 1;
            const limitNumber = parseInt(req.query.limit as string) || 4;
            const response = await this._adminService.getUser(pageNumber, limitNumber);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async userBlock(req: Request, res: Response): Promise<void> {
        try {
            const userId = new mongoose.Types.ObjectId(req.params.id);
            const response = await this._adminService.userBlock(userId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async userUnBlock(req: Request, res: Response): Promise<void> {
        try {
            const userId = new mongoose.Types.ObjectId(req.params.id);
            const response = await this._adminService.userUnBlock(userId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async userDelete(req: Request, res: Response): Promise<void> {
        try {
            let userId = new mongoose.Types.ObjectId(req.params.id);;
            userId = new Types.ObjectId(userId);
            const response = await this._adminService.userDelete(userId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const skip = parseInt(req.query.skip as string)
            const limit = parseInt(req.query.limit as string)
            const response = await this._adminService.getHost(skip, limit);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async hostBlock(req: Request, res: Response): Promise<void> {
        try {
            const hostId = new mongoose.Types.ObjectId(req.params.id);
            const response = await this._adminService.hostBlock(hostId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async hostUnBlock(req: Request, res: Response): Promise<void> {
        try {
            const hostId = new mongoose.Types.ObjectId(req.params.id);
            const response = await this._adminService.hostUnBlock(hostId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async hostDelete(req: Request, res: Response): Promise<void> {
        try {
            const hostId = req.params.id;

            if (!Types.ObjectId.isValid(hostId)) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.InvalidHostId });
            }

            const objectIdHostId = new Types.ObjectId(hostId);

            const response = await this._adminService.hostDelete(objectIdHostId);

            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async approveHost(req: Request, res: Response): Promise<void> {
        try {
            const hostId = new mongoose.Types.ObjectId(req.params.id);;

            const Id = new mongoose.Types.ObjectId(hostId);

            const response = await this._adminService.approveHost(Id);

            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async rejectHost(req: Request, res: Response): Promise<void> {
        try {
            const hostId = new mongoose.Types.ObjectId(req.params.id);;
            const response = await this._adminService.rejectHost(hostId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getAllHostels(req: Request, res: Response): Promise<void> {
        try {

            let { page, limit } = req.query
            if (!page || !limit) {
                res.status(StatusCode.OK).json({ message: Messages.PageLimit })
            }
            page = page as string
            limit = limit as string
            const response = await this._adminService.getAllHostels(page, limit);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }



    async getHostDetails(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const response = await this._adminService.getHostDetails(userId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getHostHostelData(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params.id)
            const userId = req.params.id
            const response = await this._adminService.getHostHostelData(userId)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async deleteHostel(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.id;
            if (!hostelId || typeof hostelId !== 'string') {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.NoHostelId })
                return
            }
            const response = await this._adminService.deleteHostel(hostelId)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async searchUser(req: Request, res: Response): Promise<void> {
        try {
            const name = req.query.name as string;
            const response = await this._adminService.searchUser(name)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async searchHost(req: Request, res: Response): Promise<void> {
        try {
            const name = req.query.name as string;
            const response = await this._adminService.searchHost(name);
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async searchHostel(req: Request, res: Response): Promise<void> {
        try {
            const name = req.query.name as string;
            const response = await this._adminService.searchHostel(name);
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getReviews(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.hostelId;
            const response = await this._adminService.getReviews(hostelId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getSales(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._adminService.getSales();
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async validaterefreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const response = await this._adminService.validateRefreshToken(refreshToken);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }
}

export default adminController