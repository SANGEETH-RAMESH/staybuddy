import { IWishlistRepository } from "../interface/wishlist/!WishlistRepository";
import Hostel from "../model/hostelModel";
import Wishlist, { IWishlist } from "../model/wishlistModel";
import baseRepository from "./baseRespository";




class wishlistRepository extends baseRepository<IWishlist> implements IWishlistRepository{
    constructor(){
        super(Wishlist)
    }


    async addToWishlist(id: string, userId: string): Promise<string> {
            try {
                const hostelDetails = await Hostel.findOne({ _id: id })
                if (hostelDetails) {
                    const newWishList = new Wishlist({
                        image: hostelDetails?.photos[0],
                        hostelname: hostelDetails.hostelname,
                        category: hostelDetails.category,
                        price: hostelDetails?.bedShareRoom,
                        isActive: true,
                        user_id: userId,
                        hostel_id: id
                    })
                    await newWishList.save()
                    if (newWishList) {
                        return "Added to wishlist"
                    }
                }
                return 'Cannot add to wishlist'
            } catch (error) {
                console.log(error)
                return error as string
            }
        }
    
        async removeFromWishlist(hostelId: string, userId: string): Promise<string> {
            try {
                await Wishlist.findOneAndDelete(
                    { hostel_id: hostelId, user_id: userId }
                )
                return 'Hostel Removed From Wishlist'
            } catch (error) {
                return error as string
            }
        }
    
        async checkWishlist(userId: string, hostelId: string): Promise<string> {
            try {
                const checkingWishlist = await Wishlist.findOne(
                    { hostel_id: hostelId, user_id: userId }
                )
                if (checkingWishlist) {
                    return "Already Exist"
                }
                return "Not Exist"
            } catch (error) {
                return error as string
            }
        }
    
        async getWishlist(userId: string): Promise<string | IWishlist[]> {
            try {
                const fetchWishlistData = await Wishlist.find(
                    { user_id: userId }
                )
                return fetchWishlistData
            } catch (error) {
                return error as string
            }
        }
    
        async deleteWishlist(userId: string): Promise<string> {
            try {
                const deletingWishlist = await Wishlist.deleteMany(
                    { user_id: userId }
                )
                if (deletingWishlist) {
                    return "Wishlist Deleted"
                }
                return "Wishlist Not Deleted"
    
            } catch (error) {
                return error as string
            }
        }
    
    
}

export default wishlistRepository