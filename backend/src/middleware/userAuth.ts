import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
import User from "../model/userModel";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";

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
        console.log("hjeee")
        res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.NoTokenFound });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
        if (decoded.role !== 'user') {
            res.status(StatusCode.FORBIDDEN).json({ message: Messages.AccessDeniedUser });
            return
        }

        const user = await User.findById(decoded._id);

        if (!user) {
            res.status(StatusCode.NOT_FOUND).json({ message: Messages.UserNotFound });
            return;
        }

        if (user.isBlock) {
            res.status(StatusCode.FORBIDDEN).json({ message: Messages.UserIsBlocked });
            return
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.Unauthorized, error });
    }
};

export default userAuthMiddleware;
