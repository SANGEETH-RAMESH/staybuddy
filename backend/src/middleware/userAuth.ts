import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
// import { userPayload } from "../types/commonInterfaces/tokenInterface";
import User from "../model/userModel";

// Define the AuthenticatedUser interface
export interface AuthenticatedUser {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    iat: number;
    exp: number;
    displayName?:string
}

// Extend the Express Request interface to include the user
declare module "express-serve-static-core" {
    interface Request {
        user?: AuthenticatedUser; 
    }
}

const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log(token,'tokennns')
    if (!token) {
        res.status(401).json({ message: "No token found" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

        const user = await User.findById(decoded._id);
        console.log(user,'usser')

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized", error });
    }
};

export default userAuthMiddleware;
