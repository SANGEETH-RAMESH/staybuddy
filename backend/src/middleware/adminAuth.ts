import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
import User from "../model/userModel";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";

export interface AuthenticatedAdmin {
  _id: string;
  role: 'user' | 'host' | 'admin';
  iat: number;
  exp: number;
  displayName?: string;
  email?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    admin?: AuthenticatedAdmin;
  }
}

const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.NoTokenFound });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedAdmin;
    if (decoded.role !== 'admin') {
      res.status(StatusCode.FORBIDDEN).json({ message: Messages.AccessDeniedAdmin });
      return
    }

    const admin = await User.findById(decoded._id);
    if (!admin) {
      res.status(StatusCode.NOT_FOUND).json({ message: Messages.AdminNotFound });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCode.UNAUTHORIZED).json({ message: Messages.Unauthorized, error });
  }
};

export default adminAuthMiddleware;
