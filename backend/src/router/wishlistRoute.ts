
import { Router } from 'express';
import WishlistRepository from '../respository/wishlistRepository';
import WishlistService from '../service/wishlistService';
import WishlistController from '../controller/wishlistController';
import userAuthMiddleware from '../middleware/userAuth';

const wishlist_route = Router();

const wishlistRepository = new WishlistRepository();
const wishlistService = new WishlistService(wishlistRepository);
const wishlistController = new WishlistController(wishlistService);


wishlist_route.post('/:hostelId',userAuthMiddleware,wishlistController.addToWishlist.bind(wishlistController))
wishlist_route.delete('/:hostelId',userAuthMiddleware,wishlistController.removeFromWishlist.bind(wishlistController))
wishlist_route.get('/:hostelId/check',userAuthMiddleware,wishlistController.checkWishlist.bind(wishlistController))
wishlist_route.get('/',userAuthMiddleware,wishlistController.getWishlist.bind(wishlistController))
wishlist_route.delete('/',userAuthMiddleware,wishlistController.deleteWishlist.bind(wishlistController))


export default wishlist_route;