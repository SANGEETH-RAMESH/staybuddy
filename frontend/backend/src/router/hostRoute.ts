import { Router } from "express";
import HostRepository from '../respository/hostRepository';
import HostService from '../service/hostService';
import HostController from '../controller/hostController';
import upload from '../cloudinary/multer'
import hostAuthMiddleware from "../middleware/hostAuth";
import WalletRepository from "../respository/walletRepository";
import AdminRespository from "../respository/adminRepository";
import UserRepository from "../respository/userRepository";
import { validate } from "../middleware/validateAuth";
import { forgotPasswordValidation, otpValidation, resetPasswordValidation, signInValidation, signupValidation } from "../validations/commonValidations";
const host_route = Router();

const hostRepository = new HostRepository();
const walletRepository = new WalletRepository();
const adminRepository = new AdminRespository();
const userRepository = new UserRepository();
const hostService = new HostService(hostRepository,walletRepository,adminRepository,userRepository);
const hostController = new HostController(hostService);



host_route.post('/auth/signup',validate(signupValidation),hostController.signUp.bind(hostController))
host_route.post('/auth/verify-otp',hostController.verifyOtp.bind(hostController))
host_route.post('/auth/resend-otp',validate(otpValidation),hostController.resendOtp.bind(hostController))
host_route.post('/auth/login',validate(signInValidation),hostController.verifyLogin.bind(hostController))
host_route.post('/auth/google',hostController.createGoogleAuth.bind(hostController))


host_route.post('/password/forgot',validate(forgotPasswordValidation),hostController.forgotPassword.bind(hostController))
host_route.post('/password/verify-otp',validate(otpValidation),hostController.verifyForgotPasswordOtp.bind(hostController))
host_route.post('/password/reset',validate(resetPasswordValidation),hostController.resetPassword.bind(hostController))
host_route.patch('/password/change',hostAuthMiddleware,hostController.changePassword.bind(hostController))


host_route.post('/token/refresh',hostController.validateRefreshToken.bind(hostController))


host_route.get('/',hostAuthMiddleware,hostController.getHost.bind(hostController))
host_route.get('/new',hostAuthMiddleware,hostController.newHost.bind(hostController))
host_route.patch('/',hostAuthMiddleware,hostController.editProfile.bind(hostController))


host_route.post('/approval',upload.single('file'),hostAuthMiddleware,hostController.requestApproval.bind(hostController))


host_route.get('/categories',hostController.getAllCategory.bind(hostController))
host_route.get('/users',hostAuthMiddleware,hostController.getAllUsers.bind(hostController))
host_route.get('/admin',hostAuthMiddleware,hostController.getAdmin.bind(hostController))




export default host_route