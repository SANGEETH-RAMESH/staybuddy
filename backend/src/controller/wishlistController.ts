import { IWishlistService } from "../interface/wishlist/!WishlistService";
import { Request, Response } from "express";
import { StatusCode } from "../status/statusCode";


class WishlistController {
    constructor(private _wishlistService: IWishlistService) { }


    async addToWishlist(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.hostelId
            if (req.user) {
                const userId = req.user._id
                const response = await this._wishlistService.addToWishlist(hostelId, userId)
                res.status(StatusCode.OK).json({ message: response })
            }

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async removeFromWishlist(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.hostelId;
            const userId = req.user?._id
            if (userId) {
                const response = await this._wishlistService.removeFromWishlist(hostelId, userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async checkWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const hostelId = req.params.hostelId;
            if (userId) {
                const response = await this._wishlistService.checkWishlist(userId, hostelId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this._wishlistService.getWishlist(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async deleteWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this._wishlistService.deleteWishlist(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

}

export default WishlistController