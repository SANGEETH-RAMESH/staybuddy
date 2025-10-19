import { IHostelService } from "../interface/hostel/!HostelService";
import { Request, Response } from "express";
import { StatusCode } from "../status/statusCode";
import mongoose from "mongoose";
import uploadImage from "../cloudinary/cloudinary";
import { Messages } from "../messages/messages";
import { hostelFormValidation } from "../validations/hostelValidation";
import { ValidationError } from "yup";
const ObjectId = mongoose.Types.ObjectId;

class HostelController {
    constructor(private _hostelService: IHostelService) { }

    async getHostels(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, search, lat, lng, radius, rating, minPrice, maxPrice, sort } = req.query
            console.log(req.query, 'Heyy')
            const pageStr = typeof page === 'string' ? page : '0';
            const limitStr = typeof limit === 'string' ? limit : '0';
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
            const response = await this._hostelService.getHostels(
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
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getSingleHostel(req: Request, res: Response): Promise<void> {
        try {
            console.log("heeeeee")
            const userId = req.params.id;
            const id = new ObjectId(userId)
            const response = await this._hostelService.getSingleHostel(id);
            console.log("Resss",response)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async addHostel(req: Request, res: Response): Promise<void> {
        try {
            let uploadedUrl: string | undefined;
            if (req.file && req.file.buffer) {
                uploadedUrl = await uploadImage(req.file.buffer);
            }

            const facilities = JSON.parse(req.body.facilities);

            
            let photos: string | undefined = undefined;
            if (uploadedUrl) {
                const parts = uploadedUrl.split("/");
                const version = parts[parts.indexOf("upload") + 1];
                const filename = parts.slice(parts.indexOf(version) + 1).join("/");

                photos = `${version}/${filename}`;
            }
            const response = await this._hostelService.addHostel({
                ...req.body,
                photos,
                facilities
            });

            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getHostHostels(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost
            const hostId = host?._id;
            if (!hostId) {
                res.status(StatusCode.NOT_FOUND).json({ success: true, message: Messages.NoHost })
                return
            }
            const searchStr = typeof req.query.search === 'string' ? req.query.search : '';
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
            const sortStr = typeof req.query.sort === 'string' ? req.query.sort : undefined;
            const response = await this._hostelService.getHostHostels(hostId, limit, skip, searchStr, sortStr);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async deleteHostel(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.id;
            const response = await this._hostelService.deleteHostel(hostelId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async updateHostel(req: Request, res: Response): Promise<void> {
        try {
            let photos: string[] = [];
            console.log(req.body, 'Heyyyy')
            if (req.body.photos) {
                try {
                    photos = Array.isArray(req.body.photos)
                        ? req.body.photos
                        : JSON.parse(req.body.photos);
                } catch {
                    photos = [req.body.photos];
                }
            } else if (req?.file?.buffer) {
                const uploadedUrl = await uploadImage(req.file.buffer);
                photos = [uploadedUrl];
            }
            const facilities = JSON.parse(req.body.facilities);
            console.log(facilities)
            console.log(typeof facilities, 'Tyoeeeeee')
            const data = {
                ...req.body,
                photos,
                facilities
            }
            console.log(data, 'Data')
            let validationErrors: Record<string, string> = {};
            await hostelFormValidation.validate(data, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err: ValidationError) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    })
                })
            console.log(Object.keys(validationErrors).length, 'Lneght')
            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors
                })
                return;
            }
            const processedPhotos = photos.map(photoUrl => {
                if (photoUrl.startsWith("http")) {
                    const parts = photoUrl.split("/");
                    const version = parts[parts.indexOf("upload") + 1];
                    const filename = parts.slice(parts.indexOf(version) + 1).join("/");
                    return `${version}/${filename}`;
                }
                return photoUrl;
            });

            const { existingPhotos, ...restOfBody } = req.body;
            console.log(photos, 'Phhhhhhhhhh')
            console.log(restOfBody, "Controler")
            const response = await this._hostelService.updateHostel({
                ...restOfBody,
                photos: processedPhotos,
                hostelId: req.params.id,
                facilities
            });
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getOneHostel(req: Request, res: Response): Promise<void> {
        try {
            const id = req.query.id as string;
            if (!id) {
                res.json({ success: false, message: Messages.HostelIdNotProvided });
                return;
            }
            const objectId = new ObjectId(id);
            const response = await this._hostelService.getOneHostel(objectId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id, isActive, inactiveReason } = req.body;
            const response = await this._hostelService.updateStatus(id, isActive, inactiveReason);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getAllHostel(req: Request, res: Response): Promise<void> {
        try {
            const response = await this._hostelService.getAllHostel();
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }
}

export default HostelController