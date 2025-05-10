
import { Request, Response } from "express";
// import adminService from "../service/adminService";
import { IAdminService } from "../interface/admin/IAdminService";
import mongoose, { Types } from "mongoose";
import uploadImage from "../cloudinary/cloudinary";
// const ObjectId = mongoose.Types.ObjectId;

class adminController {
    constructor(private adminService: IAdminService) {

    }

    async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            // const {admin_email,admin_password} = req.body
            const response = await this.adminService.adminLogin(req.body);
            res.status(200).json({ success: true, data: response })

        } catch (error) {
            console.log(error)
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.adminService.getUser();
            res.json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async userBlock(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body
            const response = await this.adminService.userBlock(userId);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async userUnBlock(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;
            const response = await this.adminService.userUnBlock(userId);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async userDelete(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;
            const response = await this.adminService.userDelete(userId);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            console.log('hello')
            const response = await this.adminService.getHost();
            console.log(response, 'hello')
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async hostBlock(req: Request, res: Response): Promise<void> {
        try {
            const { hostId } = req.body
            const response = await this.adminService.hostBlock(hostId);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error);
        }
    }

    async hostUnBlock(req: Request, res: Response): Promise<void> {
        try {
            const { hostId } = req.body
            const response = await this.adminService.hostUnBlock(hostId);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error);
        }
    }

    async hostDelete(req: Request, res: Response): Promise<void> {
        try {
            console.log('hey');
            console.log(req.params, 'hello');
            const { hostId } = req.params;

            // Validate the hostId format
            if (!Types.ObjectId.isValid(hostId)) {
                res.status(400).json({ success: false, message: 'Invalid hostId format' });
            }

            const objectIdHostId = new Types.ObjectId(hostId);

            const response = await this.adminService.hostDelete(objectIdHostId);

            // Send response back
            res.status(200).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async approveHost(req: Request, res: Response): Promise<void> {
        try {
            console.log('sdfs')
            const { hostId } = req.body;
            console.log(hostId, "body");
            console.log(typeof hostId, "type");

            // Convert hostId (string) into a mongoose ObjectId
            const Id = new mongoose.Types.ObjectId(hostId);
            // Pass the ObjectId to your service
            const response = await this.adminService.approveHost(Id);

            res.status(200).json({ success: true, message: response });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async rejectHost(req: Request, res: Response): Promise<void> {
        try {
            const { hostId } = req.body
            const Id = new mongoose.Types.ObjectId(hostId)

            const response = await this.adminService.rejectHost(Id);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async getAllHostels(req: Request, res: Response): Promise<void> {
        try {
            // console.log('hello')
            const response = await this.adminService.getAllHostels();
            // console.log(response,'resposne')
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async addCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body)
            console.log(req.file)
            let photo: string | undefined = undefined;

            if (req.file && req.file.buffer) {
                photo = await uploadImage(req.file.buffer)
            }
            const name = req.body.name;
            const isActive = req.body.isActive
            const response = await this.adminService.addCategory(name, isActive, photo)
            console.log(photo, "Photo")
            res.status(200).json({ message: response })
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error })
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.adminService.getAllCategory();
            res.status(200).json({ message: response });
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error })
        }
    }

    async getCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params.id)
            const id = req.params.id
            const response = await this.adminService.getCategory(id)
            res.status(200).json({ message: response })
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error })
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const { name, isActive } = req.body;
            console.log(name,isActive,id)
            const response = await this.adminService.updateCategory(id, name, isActive)
            console.log("Response",response)
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async getUserDetails(req:Request,res:Response):Promise<void>{
        try {
            console.log(req.params.id,'heello');
            const userId = req.params.id;
            const response = await this.adminService.getUserDetails(userId)
            res.status(200).json({success:true,message:response})
        } catch (error) {
            console.log(error)
        }
    }

    async getHostHostelData(req:Request,res:Response):Promise<void>{
        try {
            console.log(req.params.id)
            const userId = req.params.id
            const response = await this.adminService.getHostHostelData(userId)
            res.status(200).json({message:response})
        } catch (error) {
            console.log(error)
            res.status(400).json({message:error})
        }
    }
}

export default adminController