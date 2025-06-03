import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
import User from "../model/userModel";

// Define the AuthenticatedAdmin interface
export interface AuthenticatedAdmin {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  iat: number;
  exp: number;
}

// Extend Express Request to include admin
declare module "express-serve-static-core" {
  interface Request {
    admin?: AuthenticatedAdmin;
  }
}

const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "No token found" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedAdmin; // define this interface for admin

        const admin = await User.findById(decoded._id);
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized", error });
    }
};

export default adminAuthMiddleware;
