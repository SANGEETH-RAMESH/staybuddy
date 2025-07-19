
import { Request, Response } from "express";
// import adminService from "../service/adminService";
import { IAdminService } from "../interface/admin/IAdminService";
import mongoose, { Types } from "mongoose";
import uploadImage from "../cloudinary/cloudinary";
import { signInValidation } from "../validations/commonValidations";
import { ValidationError } from "yup";
import { categoryValidation } from "../validations/categoryValidation";
import {StatusCode} from '../status/statusCode'

class adminController {
    constructor(private adminService: IAdminService) {

    }

    async adminLogin(req: Request, res: Response): Promise<void> {
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
            const response = await this.adminService.adminLogin(req.body);
            res.status(StatusCode.OK).json({ success: true, data: response })

        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query, 'eyy')
            let { page, limit } = req.query

            const pageNumber = parseInt(req.query.page as string) || 1;
            const limitNumber = parseInt(req.query.limit as string) || 4;

            const response = await this.adminService.getUser(pageNumber, limitNumber);
            res.json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async userBlock(req: Request, res: Response): Promise<void> {
        try {
            const  userId  = new mongoose.Types.ObjectId(req.params.id);
            const response = await this.adminService.userBlock(userId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async userUnBlock(req: Request, res: Response): Promise<void> {
        try {
            const  userId  = new mongoose.Types.ObjectId(req.params.id);
            const response = await this.adminService.userUnBlock(userId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async userDelete(req: Request, res: Response): Promise<void> {
        try {
            let  userId  = new mongoose.Types.ObjectId(req.params.id);;
            userId = new Types.ObjectId(userId);
            const response = await this.adminService.userDelete(userId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            console.log('hello', req.query)
            const skip = parseInt(req.query.skip as string)
            const limit = parseInt(req.query.limit as string)
            const response = await this.adminService.getHost(skip, limit);
            console.log(response, 'hello')
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async hostBlock(req: Request, res: Response): Promise<void> {
        try {
            const  hostId  = new mongoose.Types.ObjectId(req.params.id);
            const response = await this.adminService.hostBlock(hostId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async hostUnBlock(req: Request, res: Response): Promise<void> {
        try {
            const { hostId } = req.body
            const response = await this.adminService.hostUnBlock(hostId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async hostDelete(req: Request, res: Response): Promise<void> {
        try {
            const  hostId  = req.params.id;

            if (!Types.ObjectId.isValid(hostId)) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid hostId format' });
            }

            const objectIdHostId = new Types.ObjectId(hostId);

            const response = await this.adminService.hostDelete(objectIdHostId);

            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async approveHost(req: Request, res: Response): Promise<void> {
        try {
            const hostId  = new mongoose.Types.ObjectId(req.params.id);;

            const Id = new mongoose.Types.ObjectId(hostId);

            const response = await this.adminService.approveHost(Id);

            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async rejectHost(req: Request, res: Response): Promise<void> {
        try {
            const  hostId  = new mongoose.Types.ObjectId(req.params.id);;
            const response = await this.adminService.rejectHost(hostId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getAllHostels(req: Request, res: Response): Promise<void> {
        try {
            
            let { page, limit } = req.query
            if (!page || !limit) {
                res.status(StatusCode.OK).json({ message: "Page or limit is not" })
            }
            page = page as string
            limit = limit as string
            const response = await this.adminService.getAllHostels(page, limit);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async addCategory(req: Request, res: Response): Promise<void> {
        try {
            const name = req.body.name;
            const isActive = req.body.isActive;
            const imageFile = req.file;
            console.log(imageFile, 'image')
            let validationErrors: Record<string, string> = {};

            await categoryValidation
                .validate({ name, image: imageFile }, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err) => {
                        if (err.path) {
                            if (err.path.startsWith('image.')) {
                                validationErrors['image'] = err.message;
                            } else {
                                validationErrors[err.path] = err.message;
                            }
                        }
                    });
                });


            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors,
                });
                return
            }

            let photo: string | undefined = undefined;
            if (imageFile?.buffer) {
                photo = await uploadImage(imageFile.buffer);
            }

            const response = await this.adminService.addCategory(name, isActive, photo);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query, 'query')
            const skip = parseInt(req.query.skip as string);
            const limit = parseInt(req.query.limit as string);
            const response = await this.adminService.getAllCategory(skip, limit);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query, 'query')
            console.log(req.params.id)
            const id = req.params.id
            const response = await this.adminService.getCategory(id)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            let validationErrors: Record<string, string> = {};
            await categoryValidation
                .pick(['name'])
                .validate({ name:req.body.name }, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    });
                });

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors,
                });
                return
            }
            const id = req.params.id;
            const { name, isActive } = req.body;
            console.log(name, isActive, id)
            const response = await this.adminService.updateCategory(id, name, isActive)
            console.log("Response", response)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getHostDetails(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params.id, 'heello');
            const userId = req.params.id;
            const response = await this.adminService.getHostDetails(userId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getHostHostelData(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params.id)
            const userId = req.params.id
            const response = await this.adminService.getHostHostelData(userId)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async deleteHostel(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.id;
            if (!hostelId || typeof hostelId !== 'string') {
                res.status(StatusCode.BAD_REQUEST).json({ message: "No hostel Id" })
                return
            }
            const response = await this.adminService.deleteHostel(hostelId)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.id;
            const response = await this.adminService.deleteCategory(categoryId);
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async searchCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query.name, "quer")
            const name = req.query.name;
            if (name) {
                const categoryname = name.toString();
                const response = await this.adminService.searchCategory(categoryname)
                res.status(StatusCode.OK).json({ message: response })
            }

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async searchUser(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query, "QUery")
            const name = req.query.name as string;
            const response = await this.adminService.searchUser(name)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async searchHost(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query, "Query")
            const name = req.query.name as string;
            const response = await this.adminService.searchHost(name);
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async searchHostel(req: Request, res: Response): Promise<void> {
        try {
            const name = req.query.name as string;
            const response = await this.adminService.searchHostel(name);
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getReviews(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.hostelId;
            const response = await this.adminService.getReviews(hostelId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getSales(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.adminService.getSales();
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async validaterefreshToken(req:Request,res:Response):Promise<void>{
        try {
            const {refreshToken} = req.body;
            const response = await this.adminService.validateRefreshToken(refreshToken);
            res.status(StatusCode.OK).json({message:response});
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }
}

export default adminController