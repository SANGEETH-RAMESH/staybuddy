import { Router } from 'express';
import UserRepository from '../respository/userRepository';
import UserService from '../service/userService';
import UserController from '../controller/userController'
import userAuthMiddleware from '../middleware/userAuth';
import passport from 'passport';
const user_route = Router();
// const typedMiddleware: RequestHandler = userAuthMiddleware as RequestHandler;

const userRespository = new UserRepository();
const userService = new UserService(userRespository);
const userController = new UserController(userService);


user_route.post('/signup', userController.userSignUp.bind(userController))
user_route.post('/verifyotp', userController.verifyOtp.bind(userController))
user_route.post('/verifylogin', userController.verifyLogin.bind(userController))
user_route.post('/resendOtp', userController.resendOtp.bind(userController))
user_route.post('/forgotpassword', userController.forgotPassword.bind(userController))
user_route.post('/verifyforgotpasswordotp', userController.verifyForgotPasswordOtp.bind(userController))
user_route.post('/resetPassword', userController.resetPassword.bind(userController))
user_route.get('/getUserDetails', userAuthMiddleware, userController.getUserDetails.bind(userController));
user_route.patch('/changepassword', userAuthMiddleware, userController.changePassword.bind(userController));
user_route.patch('/editprofile', userAuthMiddleware, userController.editUserDetail.bind(userController));
user_route.get('/getHostels',userAuthMiddleware,userController.getHostels.bind(userController))
user_route.get('/getsingleHostel/:id',userAuthMiddleware,userController.getSingleHostel.bind(userController))
user_route.post('/refresh',userController.validaterefreshToken.bind(userController))
// user_route.post('/bookings',userController.hostelBookings.bind(userController))
user_route.get('/getWalletDetails',userAuthMiddleware,userController.getWalletDetails.bind(userController))
user_route.post('/deposit',userAuthMiddleware,userController.walletDeposit.bind(userController))
user_route.post('/withdraw',userAuthMiddleware,userController.walletWithdraw.bind(userController))
user_route.get('/getSavedBookings/:id',userAuthMiddleware,userController.getSavedBookings.bind(userController))
user_route.post('/addToWishlist/:id',userAuthMiddleware,userController.addToWishlist.bind(userController))
user_route.delete('/removeFromWishlist/:id',userAuthMiddleware,userController.removeFromWishlist.bind(userController))
user_route.get('/checkWishlist/:id',userAuthMiddleware,userController.checkWishlist.bind(userController))
user_route.get('/getWishlist',userAuthMiddleware,userController.getWishlist.bind(userController))
user_route.delete('/deleteWishlist',userAuthMiddleware,userController.deleteWishlist.bind(userController))
user_route.get('/allHosts',userAuthMiddleware,userController.getHost.bind(userController))


user_route.use(passport.initialize());

user_route.use(passport.session());

user_route.get(
    '/auth/google',
    passport.authenticate('google-user', { scope: ['email', 'profile'] })
  );

user_route.get('/auth/google/callback',
    passport.authenticate('google-user', {
        successRedirect: '/user/google/success',
        failureRedirect: '/google/failure'
    }))

    user_route.get('/google/success', (req, res) => {
        console.log('Google Sign-in success');
        userController.googleSignUp(req, res);
    });
 

export default user_route;
