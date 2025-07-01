import { Router } from "express";
import HostelRepository from "../respository/hostelRepository";
import HostelService from "../service/hostelService";
import HostelController from "../controller/hostelController";
import userAuthMiddleware from "../middleware/userAuth";
import upload from '../cloudinary/multer'
import hostAuthMiddleware from "../middleware/hostAuth";

const hostel_route = Router();

const hostelRepository = new HostelRepository();
const hostelService = new HostelService(hostelRepository);
const hostelController = new HostelController(hostelService)


hostel_route.get('/getHostels',userAuthMiddleware,hostelController.getHostels.bind(hostelController))
hostel_route.get('/getsingleHostel/:id',userAuthMiddleware,hostelController.getSingleHostel.bind(hostelController))
hostel_route.post('/addhostel',upload.single('photos'),hostelController.addHostel.bind(hostelController))
hostel_route.get('/hostels',hostAuthMiddleware,hostelController.getHostHostels.bind(hostelController))
hostel_route.delete('/hostel/:id',hostAuthMiddleware,hostelController.deleteHostel.bind(hostelController))
hostel_route.put('/updatehostel/:id',upload.single('photos'),hostAuthMiddleware,hostelController.updateHostel.bind(hostelController))
hostel_route.get('/detailhostel',hostelController.getOneHostel.bind(hostelController))


export default hostel_route