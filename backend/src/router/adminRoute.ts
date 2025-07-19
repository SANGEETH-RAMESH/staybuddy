import {Router} from 'express'
import AdminRepository from '../respository/adminRepository';
import AdminService from '../service/adminService';
import AdminController from '../controller/adminController';
// import hostController from '../controller/hostController';
import adminAuthMiddleware from '../middleware/adminAuth';
import upload from '../cloudinary/multer'
import UserRepository from '../respository/userRepository';
import HostRepository from '../respository/hostRepository';
const admin_route = Router();


const adminRespository = new AdminRepository();
const userRepository = new UserRepository()
const hostRepository = new HostRepository()
const adminService = new AdminService(adminRespository,userRepository,hostRepository); 
const adminController = new AdminController(adminService)

admin_route.post('/login',adminController.adminLogin.bind(adminController))
admin_route.post('/token/refresh',adminController.validaterefreshToken.bind(adminController))


admin_route.get('/users',adminAuthMiddleware,adminController.getUser.bind(adminController))
admin_route.patch('/users/:id/block',adminAuthMiddleware,adminController.userBlock.bind(adminController))
admin_route.patch('/users/:id/unblock',adminAuthMiddleware,adminController.userUnBlock.bind(adminController))
admin_route.delete('/users/:id',adminAuthMiddleware,adminController.userDelete.bind(adminController))
admin_route.get('/users/search',adminAuthMiddleware,adminController.searchUser.bind(adminController));


admin_route.get('/hosts',adminAuthMiddleware,adminController.getHost.bind(adminController));
admin_route.get('/hosts/:id',adminAuthMiddleware,adminController.getHostDetails.bind(adminController))
admin_route.get('/hosts/:id/hostels',adminAuthMiddleware,adminController.getHostHostelData.bind(adminController))
admin_route.patch('/hosts/:id/block',adminAuthMiddleware,adminController.hostBlock.bind(adminController));
admin_route.patch('/hosts/:id/unblock',adminAuthMiddleware,adminController.hostUnBlock.bind(adminController));
admin_route.patch('/hosts/:id/approve',adminAuthMiddleware,adminController.approveHost.bind(adminController))
admin_route.patch('/hosts/:id/reject',adminAuthMiddleware,adminController.rejectHost.bind(adminController))
admin_route.delete('/hosts/:id',adminAuthMiddleware,adminController.hostDelete.bind(adminController))
admin_route.get('/hosts/search',adminAuthMiddleware,adminController.searchHost.bind(adminController))


admin_route.get('/hostels',adminAuthMiddleware,adminController.getAllHostels.bind(adminController))
admin_route.get('/hostels/search',adminAuthMiddleware,adminController.searchHostel.bind(adminController))
admin_route.delete('/hostels/:id',adminAuthMiddleware,adminController.deleteHostel.bind(adminController))


admin_route.post('/categories',adminAuthMiddleware,upload.single('photos'),adminController.addCategory.bind(adminController))
admin_route.get('/categories',adminAuthMiddleware,adminController.getAllCategory.bind(adminController))
admin_route.get('/categories/:id',adminAuthMiddleware,adminController.getCategory.bind(adminController))
admin_route.put('/categories/:id',adminAuthMiddleware,adminController.updateCategory.bind(adminController))
admin_route.delete('/categories/:id',adminAuthMiddleware,adminController.deleteCategory.bind(adminController))
admin_route.get('/categories/search',adminAuthMiddleware,adminController.searchCategory.bind(adminController))


admin_route.get('/reviews/:hostelId',adminAuthMiddleware,adminController.getReviews.bind(adminController))


admin_route.get('/sales',adminAuthMiddleware,adminController.getSales.bind(adminController))

export default admin_route;