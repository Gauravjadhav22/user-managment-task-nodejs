// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";
import CustomError from '../utils/customError';
import { ROLES } from '../constants';

const prisma = new PrismaClient();
interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: ROLES;
  };
}


export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any>  => {
  const token = req.headers['authorization']?.split(' ')[1]||'';
console.log(token,"fdssssssssssss");

  if (!token) {
    return next(new CustomError({ message: "Unauthorized",status:401 }));
    
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err, user) => {

    console.log(user);
    
    if (err) return res.status(403).json({ message: "Forbidden:session expired" });
    // @ts-ignore
    req.user = user;
    // @ts-ignore
    const userId = user?.id
    if (!userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId }});
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (dbUser) {
      // @ts-ignore
      req.role = dbUser.role.name;
    }

    next();
  });
};



export const authorizeRole = (...allowedRoles: ROLES[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req?.user?.role;

    if (!userRole) {
      return next(new CustomError({ message: "Access denied: No role assigned", status: 400 }));
    }

    if (!allowedRoles.includes(userRole as ROLES)) {
      return next(new CustomError({ message: "Access denied: You don't have permission", status: 403 }));
    }

    next();
  };
};
