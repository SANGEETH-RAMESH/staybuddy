import { IWishlist } from "../../model/wishlistModel";


export interface IWishlistService{
    addToWishlist(id:string,userId:string):Promise<string>,
        removeFromWishlist(hostelId:string,userId:string):Promise<string>,
        checkWishlist(userId:string,hostelId:string):Promise<string>,
        getWishlist(userId:string):Promise<string | IWishlist[]>,
        deleteWishlist(userId:string): Promise<string>,
}