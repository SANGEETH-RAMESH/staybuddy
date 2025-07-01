import { IHostelService } from "../interface/hostel/!HostelService";
import { Request, Response } from "express";
import { StatusCode } from "../status/statusCode";
import mongoose from "mongoose";
import uploadImage from "../cloudinary/cloudinary";
const ObjectId = mongoose.Types.ObjectId;

class HostelController {
    constructor(private hostelService: IHostelService) { }

    async getHostels(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, search } = req.query
            const pageStr = typeof page === 'string' ? page : '1';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const searchStr = typeof search === 'string' ? search : '';
            const response = await this.hostelService.getHostels(pageStr, limitStr, searchStr);
            res.status(StatusCode.OK).json({ success: true, response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getSingleHostel(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const id = new ObjectId(userId)
            const response = await this.hostelService.getSingleHostel(id);
            console.log(response)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async addHostel(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body, 'controller');
            let photo: string | undefined = undefined;
            if (req.file && req.file.buffer) {
                photo = await uploadImage(req.file.buffer);

            }
            const response = await this.hostelService.addHostel({
                ...req.body,
                photo,
            });
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            console.log(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getHostHostels(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost
            console.log("Controller",host)
            const hostId = host?._id;
            if (!hostId) {
                res.status(StatusCode.NOT_FOUND).json({ success: true, message: "No host" })
                return
            }
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
            const response = await this.hostelService.getHostHostels(hostId, limit, skip);
            console.log(response, 'response')
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async deleteHostel(req:Request,res:Response):Promise<void>{
        try {
            const hostelId = req.params.id;
            const response = await this.hostelService.deleteHostel(hostelId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async updateHostel(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params, 'heyyyy')
            console.log(req.body, 'heeee')
            console.log(req.file)
            let photo: string | string[] | undefined;
            if (req?.body?.existingPhotos) {
                photo = req.body.existingPhotos.replace(/^"(.*)"$/, '$1')
            }else if(req?.file?.buffer){
                // photo = await uploadImage(req.file.buffer)
                const uploadedUrl = await uploadImage(req.file.buffer);
                photo = [uploadedUrl]
            }


            const { existingPhotos,...restOfBody} = req.body;
            const response = await this.hostelService.updateHostel({
                ...restOfBody,
                photo,
                hostelId:req.params.id
            });
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error });
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
                const response = await this.hostelService.getOneHostel(objectId)
                console.log(response, "Response")
                res.status(StatusCode.OK).json({ success: true, message: response })
            } catch (error) {
                console.log(error)
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
            }
        }
}

export default HostelController