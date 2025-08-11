import { Router } from "express";
import HostRepository from '../respository/hostRepository';
import HostService from '../service/hostService';
import HostController from '../controller/hostController';
import upload from '../cloudinary/multer'
import hostAuthMiddleware from "../middleware/hostAuth";
import WalletRepository from "../respository/walletRepository";
import AdminRespository from "../respository/adminRepository";
import UserRepository from "../respository/userRepository";
const host_route = Router();

const hostRepository = new HostRepository();
const walletRepository = new WalletRepository();
const adminRepository = new AdminRespository();
const userRepository = new UserRepository();
const hostService = new HostService(hostRepository,walletRepository,adminRepository,userRepository);
const hostController = new HostController(hostService);

host_route.post('/signup',hostController.signUp.bind(hostController))
host_route.post('/verifyotp',hostController.verifyOtp.bind(hostController))
host_route.post('/forgotpassword',hostController.forgotPassword.bind(hostController))
host_route.post('/verifyforgotpasswordotp',hostController.verifyForgotPasswordOtp.bind(hostController))
host_route.post('/resendotp',hostController.resendOtp.bind(hostController))
host_route.post('/resetPassword',hostController.resetPassword.bind(hostController))
host_route.post('/verifylogin',hostController.verifyLogin.bind(hostController))
host_route.get('/getHost',hostAuthMiddleware,hostController.getHost.bind(hostController))
host_route.get('/newHost',hostAuthMiddleware,hostController.newHost.bind(hostController))
host_route.post('/approval',upload.single('file'),hostAuthMiddleware,hostController.requestApproval.bind(hostController))
host_route.post('/token/refresh',hostController.validateRefreshToken.bind(hostController))
host_route.get('/getAllCategory',hostController.getAllCategory.bind(hostController))
host_route.patch('/changepassword',hostAuthMiddleware,hostController.changePassword.bind(hostController))
host_route.patch('/editprofile',hostAuthMiddleware,hostController.editProfile.bind(hostController))
host_route.get('/allUsers',hostAuthMiddleware,hostController.getAllUsers.bind(hostController))
host_route.get('/getAdmin',hostAuthMiddleware,hostController.getAdmin.bind(hostController))

host_route.post('/google/callback',hostController.createGoogleAuth.bind(hostController))



export default host_route