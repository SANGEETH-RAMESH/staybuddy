import { ValidationError } from "yup";
import { ICategoryService } from "../interface/category/!CategoryService";
import { Messages } from "../messages/messages";
import { StatusCode } from "../status/statusCode";
import { categoryValidation } from "../validations/categoryValidation";
import { Request, Response } from "express";
import uploadImage from "../cloudinary/cloudinary";







class CategoryController {
    constructor(private _categoryService: ICategoryService) { }


    async addCategory(req: Request, res: Response): Promise<void> {
        try {
            const name = req.body.name;
            const isActive = req.body.isActive;
            const imageFile = req.file;
            let validationErrors: Record<string, string> = {};

            // await categoryValidation
            //     .validate({ name, image: imageFile }, { abortEarly: false })
            //     .catch((error: ValidationError) => {
            //         error.inner.forEach((err) => {
            //             if (err.path) {
            //                 if (err.path.startsWith('image.')) {
            //                     validationErrors['image'] = err.message;
            //                 } else {
            //                     validationErrors[err.path] = err.message;
            //                 }
            //             }
            //         });
            //     });


            // if (Object.keys(validationErrors).length > 0) {
            //     res.status(StatusCode.BAD_REQUEST).json({
            //         success: false,
            //         message: Messages.ValidationFailed,
            //         errors: validationErrors,
            //     });
            //     return
            // }

            let photo: string | undefined = undefined;
            if (imageFile?.buffer) {
                photo = await uploadImage(imageFile.buffer);
            }

            const response = await this._categoryService.addCategory(name, isActive, photo);
            res.status(StatusCode.OK).json({ success: true, message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<void> {
        try {
            const skip = parseInt(req.query.skip as string);
            const limit = parseInt(req.query.limit as string);
            const response = await this._categoryService.getAllCategory(skip, limit);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._categoryService.getCategory(id)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            let validationErrors: Record<string, string> = {};
            await categoryValidation
                .pick(['name'])
                .validate({ name: req.body.name }, { abortEarly: false })
                .catch((error: ValidationError) => {
                    error.inner.forEach((err) => {
                        if (err.path) {
                            validationErrors[err.path] = err.message;
                        }
                    });
                });

            if (Object.keys(validationErrors).length > 0) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: Messages.ValidationFailed,
                    errors: validationErrors,
                });
                return
            }
            const id = req.params.id;
            const { name, isActive } = req.body;
            const response = await this._categoryService.updateCategory(id, name, isActive)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.id;
            const response = await this._categoryService.deleteCategory(categoryId);
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async searchCategory(req: Request, res: Response): Promise<void> {
        try {
            const name = req.query.name;
            if (name) {
                const categoryname = name.toString();
                const response = await this._categoryService.searchCategory(categoryname)
                res.status(StatusCode.OK).json({ message: response })
            }

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }
}


export default CategoryController