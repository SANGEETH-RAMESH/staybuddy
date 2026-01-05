import { Request, Response, NextFunction } from "express";
import { ValidationError } from "yup";

export const validate = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                ...req.body,
                facilities: req.body.facilities ? JSON.parse(req.body.facilities) : undefined,
                photos: req.file ? [req.file.originalname] : req.files ? (req.files as Express.Multer.File[]).map(f => f.originalname) : [],
            };
            await schema.validate(data, { abortEarly: false });
            next();
        } catch (error) {
            const validationErrors: Record<string, string> = {};
            (error as ValidationError).inner.forEach(err => {
                if (err.path) validationErrors[err.path] = err.message;
            });

            res.status(400).json({
                success: false,
                message: "Validation Failed",
                errors: validationErrors
            })
        }
    }
}