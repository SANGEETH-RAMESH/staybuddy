import {Router} from 'express'
import AdminRepository from '../respository/adminRepository';
import AdminService from '../service/adminService';
import AdminController from '../controller/adminController';
// import hostController from '../controller/hostController';
import upload from '../cloudinary/multer'
const admin_route = Router();


const adminRespository = new AdminRepository();
const adminService = new AdminService(adminRespository); 
const adminController = new AdminController(adminService)

admin_route.post('/login',adminController.adminLogin.bind(adminController))
admin_route.get('/getUser',adminController.getUser.bind(adminController))
admin_route.patch('/userblock',adminController.userBlock.bind(adminController))
admin_route.patch('/userunblock',adminController.userUnBlock.bind(adminController))
admin_route.delete('/deleteuser',adminController.userDelete.bind(adminController))
admin_route.get('/getHosts',adminController.getHost.bind(adminController));
admin_route.patch('/hostblock',adminController.hostBlock.bind(adminController));
admin_route.patch('/hostunblock',adminController.hostUnBlock.bind(adminController));
admin_route.delete('/deletehost/:hostId',adminController.hostDelete.bind(adminController))
admin_route.patch('/approvehost',adminController.approveHost.bind(adminController))
admin_route.patch('/rejecthost',adminController.rejectHost.bind(adminController))
admin_route.get('/getHostel',adminController.getAllHostels.bind(adminController))
admin_route.post('/addCategory',upload.single('photos'),adminController.addCategory.bind(adminController))
admin_route.get('/getAllCategory',adminController.getAllCategory.bind(adminController))
admin_route.get('/getCategory/:id',adminController.getCategory.bind(adminController))
admin_route.put('/updateCategory/:id',adminController.updateCategory.bind(adminController))
admin_route.get('/getUserDetails/:id',adminController.getUserDetails.bind(adminController))
admin_route.get('/getHostHostelData/:id',adminController.getHostHostelData.bind(adminController))


export default admin_route;