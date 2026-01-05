import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import Host from "../model/hostModel";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";

const hostAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.NoTokenFound });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as hostPayload;
        if (decoded.role !== 'host') {
            res.status(StatusCode.FORBIDDEN).json({ message: Messages.AccessDeniedHost });
            return
        }

        const host = await Host.findById(decoded._id);
        if (!host) {
            res.status(StatusCode.NOT_FOUND).json({ message: Messages.HostNotFound });
            return;
        }
        if (host.isBlock) {
            res.status(StatusCode.FORBIDDEN).json({ message: Messages.HostIsBlocked });
            return
        }
        req.customHost = decoded;
        next();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            console.error("JWT Error:", error.message);
            res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.InvalidToken, error: error.message });
        } else if (error instanceof TokenExpiredError) {
            console.error("Token Expired:", error.message);
            res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.TokenExpired, error: error.message });
        } else {
            console.error("Unknown Error:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: Messages.IntervalServerError });
        }
    }
};

export default hostAuthMiddleware;
