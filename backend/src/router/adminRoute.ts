import {Router} from 'express'
import AdminRepository from '../respository/adminRepository';
import AdminService from '../service/adminService';
import AdminController from '../controller/adminController';
// import hostController from '../controller/hostController';
import adminAuthMiddleware from '../middleware/adminAuth';
import upload from '../cloudinary/multer'
const admin_route = Router();


const adminRespository = new AdminRepository();
const adminService = new AdminService(adminRespository); 
const adminController = new AdminController(adminService)

admin_route.post('/login',adminController.adminLogin.bind(adminController))
admin_route.get('/getUser',adminAuthMiddleware,adminController.getUser.bind(adminController))
admin_route.patch('/userblock',adminAuthMiddleware,adminController.userBlock.bind(adminController))
admin_route.patch('/userunblock',adminAuthMiddleware,adminController.userUnBlock.bind(adminController))
admin_route.delete('/deleteuser',adminAuthMiddleware,adminController.userDelete.bind(adminController))
admin_route.get('/getHosts',adminAuthMiddleware,adminController.getHost.bind(adminController));
admin_route.patch('/hostblock',adminAuthMiddleware,adminController.hostBlock.bind(adminController));
admin_route.patch('/hostunblock',adminAuthMiddleware,adminController.hostUnBlock.bind(adminController));
admin_route.delete('/deletehost/:hostId',adminAuthMiddleware,adminController.hostDelete.bind(adminController))
admin_route.patch('/approvehost',adminAuthMiddleware,adminController.approveHost.bind(adminController))
admin_route.patch('/rejecthost',adminAuthMiddleware,adminController.rejectHost.bind(adminController))
admin_route.get('/getHostel',adminAuthMiddleware,adminController.getAllHostels.bind(adminController))
admin_route.post('/addCategory',adminAuthMiddleware,upload.single('photos'),adminController.addCategory.bind(adminController))
admin_route.get('/getAllCategory',adminAuthMiddleware,adminController.getAllCategory.bind(adminController))
admin_route.get('/getCategory/:id',adminAuthMiddleware,adminController.getCategory.bind(adminController))
admin_route.put('/updateCategory/:id',adminAuthMiddleware,adminController.updateCategory.bind(adminController))
admin_route.get('/getUserDetails/:id',adminAuthMiddleware,adminController.getUserDetails.bind(adminController))
admin_route.get('/getHostHostelData/:id',adminAuthMiddleware,adminController.getHostHostelData.bind(adminController))
admin_route.delete('/hostel',adminAuthMiddleware,adminController.deleteHostel.bind(adminController))
admin_route.delete('/category',adminAuthMiddleware,adminController.deleteCategory.bind(adminController))
admin_route.get('/search',adminAuthMiddleware,adminController.searchCategory.bind(adminController))
admin_route.get('/searchuser',adminAuthMiddleware,adminController.searchUser.bind(adminController));
admin_route.get('/searchhost',adminAuthMiddleware,adminController.searchHost.bind(adminController))
admin_route.get('/searchhostel',adminAuthMiddleware,adminController.searchHostel.bind(adminController))
admin_route.get('/reviews/:hostelId',adminAuthMiddleware,adminController.getReviews.bind(adminController))
admin_route.get('/sales',adminAuthMiddleware,adminController.getSales.bind(adminController))


export default admin_route;