import { Router } from 'express';
import UserRepository from '../respository/userRepository';
import WalletRepository from '../respository/walletRepository';
import UserService from '../service/userService';
import UserController from '../controller/userController'
import userAuthMiddleware from '../middleware/userAuth';
import HostRepository from '../respository/hostRepository';
const user_route = Router();

const userRespository = new UserRepository();
const hostRepository = new HostRepository();
const walletRepository = new WalletRepository()
const userService = new UserService(userRespository,walletRepository,hostRepository);
const userController = new UserController(userService);


user_route.post('/auth/signup', userController.userSignUp.bind(userController))
user_route.post('/auth/verify-otp', userController.verifyOtp.bind(userController))
user_route.post('/auth/login', userController.verifyLogin.bind(userController))
user_route.post('/auth/resend-otp', userController.resendOtp.bind(userController))
user_route.post('/auth/forgot-password', userController.forgotPassword.bind(userController))
user_route.post('/auth/verify-forgot-otp', userController.verifyForgotPasswordOtp.bind(userController))
user_route.post('/auth/reset-password', userController.resetPassword.bind(userController))
user_route.post('/token/refresh',userController.validaterefreshToken.bind(userController))

user_route.post('/google/callback',userController.createGoogleAuth.bind(userController))

user_route.get('/users', userAuthMiddleware, userController.getUserDetails.bind(userController));

user_route.patch('/profile', userAuthMiddleware, userController.editUserDetail.bind(userController));
user_route.patch('/profile/change-password', userAuthMiddleware, userController.changePassword.bind(userController));


user_route.get('/hosts',userAuthMiddleware,userController.getHost.bind(userController))
user_route.put('/notifications/mark-all-read',userAuthMiddleware,userController.markAllRead.bind(userController))




export { user_route, userService };
