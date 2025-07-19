import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
// import { userPayload } from "../types/commonInterfaces/tokenInterface";
import User from "../model/userModel";

export interface AuthenticatedUser {
    _id: string;
    role: 'user' | 'host' | 'admin';
    iat: number;
    exp: number;
    displayName?: string;
    email?: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: AuthenticatedUser;
    }
}

const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: "No token found" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
        if (decoded.role !== 'user') {
            res.status(403).json({ message: 'Access denied:Not a USER,,,' });
            return
        }

        const user = await User.findById(decoded._id);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.isBlock) {
            res.status(403).json({ message: "User is blocked" });
            return
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized", error });
    }
};

export default userAuthMiddleware;
