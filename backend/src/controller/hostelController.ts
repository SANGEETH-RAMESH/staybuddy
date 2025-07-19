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
            const { page, limit, search, lat, lng, radius, rating, minPrice, maxPrice, sort } = req.query
            const pageStr = typeof page === 'string' ? page : '1';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const searchStr = typeof search === 'string' ? search : '';
            const latNum = lat && typeof lat === 'string' ? parseFloat(lat) : undefined;
            const lngNum = lng && typeof lng === 'string' ? parseFloat(lng) : undefined;
            const radiusNum = radius && typeof radius === 'string' ? parseFloat(radius) : undefined;
            const ratingNum = rating && typeof rating === 'string' ? parseFloat(rating) : 0;
            const minPriceNum = minPrice && typeof minPrice === 'string' ? parseFloat(minPrice) : undefined;
            const maxPriceNum = maxPrice && typeof maxPrice === 'string' ? parseFloat(maxPrice) : undefined;
            const sortStr = typeof sort === 'string' ? sort : undefined;
            let facilitiesArr: string[] = [];
            if (req.query.facilities) {
                if (Array.isArray(req.query.facilities)) {
                    facilitiesArr = req.query.facilities.map((f) =>
                        typeof f === 'string' ? f.toLowerCase() : ''
                    ).filter(f => f);
                } else if (typeof req.query.facilities === 'string') {
                    facilitiesArr = [req.query.facilities.toLowerCase()];
                }
            }
            const response = await this.hostelService.getHostels(
                pageStr,
                limitStr,
                searchStr,
                latNum,
                lngNum,
                radiusNum,
                {
                    rating: ratingNum,
                    facilities: facilitiesArr,
                    minPrice: minPriceNum,
                    maxPrice: maxPriceNum,
                    sort: sortStr
                }
            );
            res.status(StatusCode.OK).json({ success: true, response })
        } catch (error: any) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error?.message as string })
        }
    }

    async getSingleHostel(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const id = new ObjectId(userId)
            const response = await this.hostelService.getSingleHostel(id);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async addHostel(req: Request, res: Response): Promise<void> {
        try {
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
            console.log("Abjfdfljsdlfjdslfjdsf", host)
            const hostId = host?._id;
            if (!hostId) {
                res.status(StatusCode.NOT_FOUND).json({ success: true, message: "No host" })
                return
            }
            const searchStr = typeof req.query.search === 'string' ? req.query.search : '';
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
            const response = await this.hostelService.getHostHostels(hostId, limit, skip, searchStr);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async deleteHostel(req: Request, res: Response): Promise<void> {
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
            let photo: string | string[] | undefined;
            if (req?.body?.existingPhotos) {
                photo = req.body.existingPhotos.replace(/^"(.*)"$/, '$1')
            } else if (req?.file?.buffer) {
                // photo = await uploadImage(req.file.buffer)
                const uploadedUrl = await uploadImage(req.file.buffer);
                photo = [uploadedUrl]
            }


            const { existingPhotos, ...restOfBody } = req.body;
            const response = await this.hostelService.updateHostel({
                ...restOfBody,
                photo,
                hostelId: req.params.id
            });
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error });
        }
    }

    async getOneHostel(req: Request, res: Response): Promise<void> {
        try {
            const id = req.query.id as string;
            if (!id) {
                res.json({ success: false, message: "Hostel ID not provided" });
                return;
            }
            const objectId = new ObjectId(id);
            const response = await this.hostelService.getOneHostel(objectId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id, isActive, inactiveReason } = req.body;
            const response = await this.hostelService.updateStatus(id, isActive, inactiveReason);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getAllHostel(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.hostelService.getAllHostel();
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }
}

export default HostelController