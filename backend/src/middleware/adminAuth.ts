import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middlewareConfig";
import User from "../model/userModel";

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
  console.log(token,'daaaaaaaaaaaa')

  if (!token) {
    res.status(401).json({ message: "No token found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedAdmin;

    if (decoded.role !== 'admin') {
      res.status(403).json({ messag: 'Access denied:Not a admin' });
      return
    }

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
