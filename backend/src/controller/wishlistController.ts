import { IWishlistService } from "../interface/wishlist/!WishlistService";
import { Request, Response } from "express";
import { StatusCode } from "../status/statusCode";


class WishlistController{
    constructor(private wishlistService:IWishlistService){ }


    async addToWishlist(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.id
            if (req.user) {
                const userId = req.user._id
                const response = await this.wishlistService.addToWishlist(hostelId, userId)
                res.status(StatusCode.OK).json({ message: response })
            }

        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async removeFromWishlist(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params.id, "delete")
            const hostelId = req.params.id;
            const userId = req.user?._id
            if (userId) {
                const response = await this.wishlistService.removeFromWishlist(hostelId, userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
           res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async checkWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const hostelId = req.params.id;
            if (userId) {
                const response = await this.wishlistService.checkWishlist(userId, hostelId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this.wishlistService.getWishlist(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async deleteWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this.wishlistService.deleteWishlist(userId)
                res.status(StatusCode.OK).json({ message: response })
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

}

export default WishlistController