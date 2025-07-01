import { Router } from "express";
import HostRepository from '../respository/hostRepository';
import HostService from '../service/hostService';
import HostController from '../controller/hostController';
import upload from '../cloudinary/multer'
import hostAuthMiddleware from "../middleware/hostAuth";
import passport from "passport";
import WalletRepository from "../respository/walletRepository";
const host_route = Router();

const hostRepository = new HostRepository();
const walletRepository = new WalletRepository()
const hostService = new HostService(hostRepository,walletRepository);
const hostController = new HostController(hostService);

host_route.post('/signup',hostController.SignUp.bind(hostController))
host_route.post('/verifyotp',hostController.VerifyOtp.bind(hostController))
host_route.post('/forgotpassword',hostController.forgotPassword.bind(hostController))
host_route.post('/verifyforgotpasswordotp',hostController.verifyForgotPasswordOtp.bind(hostController))
host_route.post('/resendotp',hostController.resendOtp.bind(hostController))
host_route.post('/resetPassword',hostController.resetPassword.bind(hostController))
host_route.post('/verifylogin',hostController.verifyLogin.bind(hostController))
host_route.get('/getHost',hostAuthMiddleware,hostController.getHost.bind(hostController))
host_route.get('/newHost',hostAuthMiddleware,hostController.newHost.bind(hostController))
host_route.post('/approval',upload.single('file'),hostAuthMiddleware,hostController.requestApproval.bind(hostController))
host_route.post('/refresh',hostController.validateRefreshToken.bind(hostController))
host_route.get('/getAllCategory',hostController.getAllCategory.bind(hostController))
host_route.patch('/changepassword',hostAuthMiddleware,hostController.changePassword.bind(hostController))
host_route.patch('/editprofile',hostAuthMiddleware,hostController.editProfile.bind(hostController))
host_route.get('/allUsers',hostAuthMiddleware,hostController.getAllUsers.bind(hostController))
host_route.get('/getAdmin',hostAuthMiddleware,hostController.getAdmin.bind(hostController))


host_route.use(passport.initialize());
host_route.use(passport.session());

host_route.get(
    '/auth/google',
    passport.authenticate('google-host', { scope: ['email', 'profile'] })
  );

host_route.get('/auth/google/callback',
    passport.authenticate('google-host',{
        successRedirect:'/host/google/success',
        failureRedirect:'/host/google/failure'
    })
)


host_route.get('/google/success',(req,res) =>{
    console.log('host google')
    hostController.hostGoogleSignUp(req,res)
})



export default host_route