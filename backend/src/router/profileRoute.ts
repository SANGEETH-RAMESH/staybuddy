import { Router } from 'express';
import { validate } from '../middleware/validateAuth';
import { profileUpdateValidation } from '../validations/profileUpdateValidation ';
import userAuthMiddleware from '../middleware/userAuth';
import ProfileRepository from '../respository/profileRepository';
import ProfileService from '../service/profileService';
import ProfileController from '../controller/profileController';

const profile_route = Router();


const profileRepository = new ProfileRepository();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

profile_route.get('/users', profileController.getUserDetails.bind(profileController));
profile_route.patch('/change-password', userAuthMiddleware, profileController.changePassword.bind(profileController));
profile_route.patch('/', validate(profileUpdateValidation),userAuthMiddleware, profileController.editUserDetail.bind(profileController));


export default profile_route;