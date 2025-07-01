import { Router } from 'express';
import UserRepository from '../respository/userRepository';
import WalletRepository from '../respository/walletRepository';
import UserService from '../service/userService';
import UserController from '../controller/userController'
import userAuthMiddleware from '../middleware/userAuth';
import passport from 'passport';
import HostRepository from '../respository/hostRepository';
const user_route = Router();

const userRespository = new UserRepository();
const hostRepository = new HostRepository();
const walletRepository = new WalletRepository()
const userService = new UserService(userRespository,walletRepository,hostRepository);
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
user_route.post('/refresh',userController.validaterefreshToken.bind(userController))
user_route.get('/allHosts',userAuthMiddleware,userController.getHost.bind(userController))
user_route.put('/mark-all-read',userAuthMiddleware,userController.markAllRead.bind(userController))



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
 

export { user_route, userService };
