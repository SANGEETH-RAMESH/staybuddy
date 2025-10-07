import { Router } from "express";
import CategoryRepository from "../respository/categoryRepository";
import CategoryService from "../service/categoryService";
import CategoryController from "../controller/categoryController";
import adminAuthMiddleware from "../middleware/adminAuth";
import upload from '../cloudinary/multer'
import { validate } from "../middleware/validateAuth";
import { categoryValidation } from "../validations/categoryValidation";

const category_route = Router();

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);


category_route.post('/categories',validate(categoryValidation),adminAuthMiddleware,upload.single('photos'),categoryController.addCategory.bind(categoryController))
category_route.get('/categories',adminAuthMiddleware,categoryController.getAllCategory.bind(categoryController))
category_route.get('/categories/:id',adminAuthMiddleware,categoryController.getCategory.bind(categoryController))
category_route.put('/categories/:id',adminAuthMiddleware,categoryController.updateCategory.bind(categoryController))
category_route.delete('/categories/:id',adminAuthMiddleware,categoryController.deleteCategory.bind(categoryController))
category_route.get('/categories/search',adminAuthMiddleware,categoryController.searchCategory.bind(categoryController))

export default category_route;   