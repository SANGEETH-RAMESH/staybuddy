import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
// import { userPayload } from "../types/commonInterfaces/tokenInterface";
import User from "../model/userModel";
import Host from "../model/hostModel";
import { Types } from "mongoose";

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

const userOrHostAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: "No token found" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

        if (decoded.role === 'user') {
            const user = await User.findById(decoded._id);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return
            }
            if (user.isBlock) {
                res.status(403).json({ message: "User is blocked" });
                return
            }
            req.user = decoded;
        } else if (decoded.role === 'host') {
            const host = await Host.findById(decoded._id);
            if (!host) {
                res.status(404).json({ message: "Host not found" });
                return
            }
            if (host.isBlock) {
                res.status(403).json({ message: "Host is blocked" });
                return
            }
            req.customHost = {
                ...decoded,
                _id: new Types.ObjectId(decoded._id),
                role: 'host'
            };;
        } else {
            res.status(403).json({ message: "Access denied: Invalid role" });
            return
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized", error });
        return
    }
};

export default userOrHostAuth;
