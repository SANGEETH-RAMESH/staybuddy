import { Router } from "express";
import HostRepository from '../respository/hostRepository';
import HostService from '../service/hostService';
import HostController from '../controller/hostController';
import upload from '../cloudinary/multer'
import hostAuthMiddleware from "../middleware/hostAuth";
import passport from "passport";
const host_route = Router();

const hostRepository = new HostRepository();
const hostService = new HostService(hostRepository);
const hostController = new HostController(hostService);

host_route.post('/signup',hostController.SignUp.bind(hostController))
host_route.post('/verifyotp',hostController.VerifyOtp.bind(hostController))
host_route.post('/forgotpassword',hostController.forgotPassword.bind(hostController))
host_route.post('/verifyforgotpasswordotp',hostController.verifyForgotPasswordOtp.bind(hostController))
host_route.post('/resendotp',hostController.resendOtp.bind(hostController))
host_route.post('/resetPassword',hostController.resetPassword.bind(hostController))
host_route.post('/verifylogin',hostController.verifyLogin.bind(hostController))
host_route.post('/addhostel',upload.single('photos'),hostController.addHostel.bind(hostController))
host_route.get('/getHostels',hostAuthMiddleware,hostController.getHostels.bind(hostController))
host_route.get('/getHost',hostAuthMiddleware,hostController.getHost.bind(hostController))
host_route.get('/newHost',hostAuthMiddleware,hostController.newHost.bind(hostController))
host_route.post('/approval',upload.single('file'),hostAuthMiddleware,hostController.requestApproval.bind(hostController))
host_route.get('/detailhostel',hostController.getOneHostel.bind(hostController))
host_route.post('/refresh',hostController.validateRefreshToken.bind(hostController))
host_route.get('/getAllCategory',hostController.getAllCategory.bind(hostController))
host_route.get('/getWalletDetails',hostAuthMiddleware,hostController.getWalletDetails.bind(hostController))
host_route.get('/getBookings/:id',hostAuthMiddleware,hostController.getBookings.bind(hostController))
host_route.patch('/changepassword',hostAuthMiddleware,hostController.changePassword.bind(hostController))
host_route.patch('/editprofile',hostAuthMiddleware,hostController.editProfile.bind(hostController))
host_route.post('/deposit',hostAuthMiddleware,hostController.walletDeposit.bind(hostController))
host_route.post('/withdraw',hostAuthMiddleware,hostController.walletWithDraw.bind(hostController))
// host_route.get('/getChat/:id',hostAuthMiddleware,hostController.getChat.bind(hostController))
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