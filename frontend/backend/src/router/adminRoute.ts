import {Router} from 'express'
import AdminRepository from '../respository/adminRepository';
import AdminService from '../service/adminService';
import AdminController from '../controller/adminController';
import adminAuthMiddleware from '../middleware/adminAuth';
import UserRepository from '../respository/userRepository';
import HostRepository from '../respository/hostRepository';
import HostelRepository from '../respository/hostelRepository';
import OrderRepository from '../respository/orderRepository';
import { validate } from '../middleware/validateAuth';
import { signInValidation } from '../validations/commonValidations';
const admin_route = Router();


const adminRespository = new AdminRepository();
const userRepository = new UserRepository();
const hostRepository = new HostRepository();
const hostelRepository = new HostelRepository();
const orderRepository = new OrderRepository();
const adminService = new AdminService(adminRespository,userRepository,hostRepository,hostelRepository,orderRepository); 
const adminController = new AdminController(adminService)

admin_route.post('/login',validate(signInValidation),adminController.adminLogin.bind(adminController))
admin_route.post('/token/refresh',adminController.validaterefreshToken.bind(adminController))


admin_route.get('/users',adminAuthMiddleware,adminController.getUser.bind(adminController))
admin_route.patch('/users/:id/block',adminAuthMiddleware,adminController.userBlock.bind(adminController))
admin_route.patch('/users/:id/unblock',adminAuthMiddleware,adminController.userUnBlock.bind(adminController))
admin_route.delete('/users/:id',adminAuthMiddleware,adminController.userDelete.bind(adminController))
admin_route.get('/users/search',adminAuthMiddleware,adminController.searchUser.bind(adminController));


admin_route.get('/hosts',adminAuthMiddleware,adminController.getHost.bind(adminController));
admin_route.get('/hosts/search',adminAuthMiddleware,adminController.searchHost.bind(adminController))
admin_route.get('/hosts/:id',adminAuthMiddleware,adminController.getHostDetails.bind(adminController))
admin_route.get('/hosts/:id/hostels',adminAuthMiddleware,adminController.getHostHostelData.bind(adminController))
admin_route.patch('/hosts/:id/block',adminAuthMiddleware,adminController.hostBlock.bind(adminController));
admin_route.patch('/hosts/:id/unblock',adminAuthMiddleware,adminController.hostUnBlock.bind(adminController));
admin_route.patch('/hosts/:id/approve',adminAuthMiddleware,adminController.approveHost.bind(adminController))
admin_route.patch('/hosts/:id/reject',adminAuthMiddleware,adminController.rejectHost.bind(adminController))
admin_route.delete('/hosts/:id',adminAuthMiddleware,adminController.hostDelete.bind(adminController))


admin_route.get('/hostels',adminAuthMiddleware,adminController.getAllHostels.bind(adminController))
admin_route.get('/hostels/search',adminAuthMiddleware,adminController.searchHostel.bind(adminController))
admin_route.delete('/hostels/:id',adminAuthMiddleware,adminController.deleteHostel.bind(adminController))


admin_route.get('/reviews/:hostelId',adminAuthMiddleware,adminController.getReviews.bind(adminController))


admin_route.get('/sales',adminAuthMiddleware,adminController.getSales.bind(adminController))

export default admin_route;