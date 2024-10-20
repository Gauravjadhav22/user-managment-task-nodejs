import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware to check if the user is an admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    //   @ts-ignore
    const userId = req?.user?.id;

    const user = await prisma.user.findUnique({ where: { id: userId }});

    if (user?.role!== 'ADMIN') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    next();
};

// Middleware to check if the user is the owner of the resource or an admin
export const isSelfOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    //   @ts-ignore
    const userId = req?.user?.id;
    const targetUserId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (userId !== targetUserId && user?.role!== 'ADMIN') {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    next();
};
