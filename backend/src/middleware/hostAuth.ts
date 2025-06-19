import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import Host from "../model/hostModel";

const hostAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // console.log('MAcha')
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        // console.log("No token found");
        res.status(401).json({ message: "No token found" });
        return;
    }

    // console.log("Token found, verifying...");

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as hostPayload;
        // console.log("Decoded Token:", decoded);

        const host = await Host.findById(decoded._id);

        if (!host) {
            res.status(404).json({ message: "Host not found" });
            return;
        }
        if(host.isBlock){
            res.status(403).json({ message: "Host is blocked" });
            return
        }
        // console.log('hey')
        req.customHost = decoded;
        next();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            console.error("JWT Error:", error.message);
            res.status(401).json({ message: "Invalid token", error: error.message });
        } else if (error instanceof TokenExpiredError) {
            console.error("Token Expired:", error.message);
            res.status(401).json({ message: "Token expired", error: error.message });
        } else {
            console.error("Unknown Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

export default hostAuthMiddleware;
