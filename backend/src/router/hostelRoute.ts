import { Router } from "express";
import HostelRepository from "../respository/hostelRepository";
import OrderRepository from "../respository/orderRepository";
import HostelService from "../service/hostelService";
import HostelController from "../controller/hostelController";
import userAuthMiddleware from "../middleware/userAuth";
import upload from '../cloudinary/multer'
import hostAuthMiddleware from "../middleware/hostAuth";

const hostel_route = Router();

const hostelRepository = new HostelRepository();
const orderRepository = new OrderRepository();
const hostelService = new HostelService(hostelRepository,orderRepository);
const hostelController = new HostelController(hostelService)

const user_route = Router()
const host_route = Router()
const admin_route =Router()

hostel_route.use('/user',user_route);
hostel_route.use('/host',host_route)
hostel_route.use('/admin',admin_route)


user_route.get('/',userAuthMiddleware,hostelController.getHostels.bind(hostelController))
user_route.get('/:id',userAuthMiddleware,hostelController.getSingleHostel.bind(hostelController))
user_route.get('/all',userAuthMiddleware,hostelController.getAllHostel.bind(hostelController))


host_route.get('/hostels',hostAuthMiddleware,hostelController.getHostHostels.bind(hostelController))
host_route.post('/',upload.single('photos'),hostelController.addHostel.bind(hostelController))
host_route.delete('/:id',hostAuthMiddleware,hostelController.deleteHostel.bind(hostelController))
host_route.put('/:id',upload.single('photos'),hostAuthMiddleware,hostelController.updateHostel.bind(hostelController))
host_route.get('/detail',hostelController.getOneHostel.bind(hostelController));
host_route.patch('/status',hostAuthMiddleware,hostelController.updateStatus.bind(hostelController))



export default hostel_route