import { IWishlistRepository } from "../interface/wishlist/!WishlistRepository";
import { IWishlistService } from "../interface/wishlist/!WishlistService";
import { IWishlist } from "../model/wishlistModel";



class WishlistService implements IWishlistService{
    constructor(private _wishlistRepository:IWishlistRepository){ }
  
    async addToWishlist(id: string, userId: string): Promise<string> {
        try {
            const response = await this._wishlistRepository.addToWishlist(id, userId);
            return response
        } catch (error) {
            return error as string
        }
    }
 
    async removeFromWishlist(hostelId: string, userId: string): Promise<string> {
        try {
            const response = await this._wishlistRepository.removeFromWishlist(hostelId, userId)
            return response
        } catch (error) {
            return error as string
        }
    }

    async checkWishlist(userId: string, hostelId: string): Promise<string> {
        try {
            const response = await this._wishlistRepository.checkWishlist(userId, hostelId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getWishlist(userId: string): Promise<string | IWishlist[]> {
        try {
            const response = await this._wishlistRepository.getWishlist(userId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async deleteWishlist(userId: string): Promise<string> {
        try {
            const response = await this._wishlistRepository.deleteWishlist(userId)
            return response
        } catch (error) {
            return error as string
        }
    }

}

export default WishlistService