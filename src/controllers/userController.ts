// controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { ROLES } from "../constants";
import { FormatResponse } from "../utils/responseFormater";
import CustomError from "../utils/customError";

const prisma = new PrismaClient();

// Get Me
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserId = req?.user?.id;
    try {


        const user = await prisma.user.findUnique({
            where: { id: requestingUserId }, select: {
                firstName: true, lastName: true,disable:true, email: true, phone: true, avatar: true, id: true, role: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(FormatResponse({ data: user }));
    } catch (error) {
        console.error("Get user error:", error);
        next(error)
    }
};
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserId = req?.user?.id;
    //   @ts-ignore
    const requestingRole = req?.user?.role
    try {
        if (userId !== requestingUserId && requestingRole !== ROLES.ADMIN) {
            return next(new CustomError({ message: "Access denied", status: 403 }));

        }

        const user = await prisma.user.findUnique({
            where: { id: userId }, select: {
                firstName: true, lastName: true,disable:true,  email: true, phone: true, avatar: true, id: true, role: true
            }
        });
        if (!user) {
            return next(new CustomError({ message: "User not found", status: 404 }));
        }

        res.status(200).json(FormatResponse({ data: user }));
    } catch (error) {
        console.error("Get user error:", error);
        next(error)
    }
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserRole = req?.user?.role;
    //   @ts-ignore
    const requestingUserId = req?.user?.id;

    // Regular users can only update their own profile
    if (ROLES.ADMIN !== requestingUserRole && requestingUserId !== userId) {
        return res.status(403).json({ message: "Access denied" });
    }

    const { firstName, lastName, email, phone } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const emailExist = await prisma.user.findFirst({
            where: {
              AND: [
                { email: email },
                { id: { not: userId } } 
              ]
            }
          });
          
          
        // Ensure the user exists
        if (!user) {
            return next(new CustomError({ message: "User not found", status: 404 }));
        }
        
        if (emailExist) {
            return next(new CustomError({ message: "email already exist", status: 400 }));
        }

        // Restrict for non-admins trying to update other users' data
        if (requestingUserId !== userId && ROLES.ADMIN !== requestingUserRole) {
            return next(new CustomError({ message: "Only admin can update other users", status: 403 }));
        }

        // Restrict for an admin trying to update another admin's data
        if (ROLES.ADMIN === requestingUserRole && ROLES.ADMIN === user.role && requestingUserId !== user.id) {
            return next(new CustomError({ message: "You cannot update another Admin's data", status: 403 }));
        }

        // Update the user's data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName, email, phone },
            select: {
                firstName: true, lastName: true, email: true,disable:true,  phone: true, avatar: true, id: true, role: true
            }
        });

        return res.status(200).json(FormatResponse({ data: updatedUser, message: "Updated successfully" }));
    } catch (error) {
        console.error("Update user error:", error);
        return next(error);
    }
};

// Delete
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserRole = req?.user?.role;
    //   @ts-ignore
    const requestingUserId = req?.user?.id;

    // Regular users can only update their own profile
    if (ROLES.ADMIN !== requestingUserRole && requestingUserId !== userId) {
        return next(new CustomError({ message: "Access denied", status: 403 }));
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Ensure the user exists
        if (!user) {
            return next(new CustomError({ message: "User not found", status: 404 }));
        }

        // Restrict for non-admins trying to update other users' data
        if (requestingUserId !== userId && ROLES.ADMIN !== requestingUserRole) {
            return next(new CustomError({ message: "Only admin can delete other users", status: 403 }));
        }

        // Restrict for an admin trying to update another admin's data
        if (ROLES.ADMIN === requestingUserRole && ROLES.ADMIN === user.role && requestingUserId !== user.id) {
            return next(new CustomError({ message: "You cannot delate another Admin", status: 403 }));
        }
        await prisma.user.delete({ where: { id: userId } });

        res.status(200).json(FormatResponse({ message: "deleted successfully." }));
    } catch (error) {
        console.error("Delete user error:", error);
        next(error)
    }
};
// Disable user
export const disableUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { disable } = req.body
    console.log(disable);
    
    const userId = parseInt(req.params.id);
    //   @ts-ignore
    const requestingUserRole = req?.user?.role;
    //   @ts-ignore
    const requestingUserId = req?.user?.id;

    // Regular users can only update their own profile
    if (ROLES.ADMIN !== requestingUserRole && requestingUserId !== userId) {
        return next(new CustomError({ message: "Access denied", status: 403 }));
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Ensure the user exists
        if (!user) {
            return next(new CustomError({ message: "User not found", status: 404 }));
        }

        // Restrict for non-admins trying to update other users' data
        if (requestingUserId !== userId && ROLES.ADMIN !== requestingUserRole) {
            return next(new CustomError({ message: "Only admin can disable other users", status: 403 }));
        }

        // Restrict for an admin trying to update another admin's data
        if (ROLES.ADMIN === requestingUserRole && ROLES.ADMIN === user.role && requestingUserId !== user.id) {
            return next(new CustomError({ message: "You cannot disable another Admin's data", status: 403 }));
        }
        await prisma.user.update({ where: { id: userId }, data: { disable} });
        res.status(200).json(FormatResponse({ message: "disabled successfully." }));
    } catch (error) {
        console.error("Delete user error:", error);
        next(error)
    }
};
// make user an admin
export const makeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    //   @ts-ignore
    const userId = parseInt(req.params.id);

    if (!userId) {

        next(new CustomError({ message: "invalid userId" }))
    }
    try {
        const user = await prisma.user.update({ where: { id: userId }, data: { role: ROLES.ADMIN } });
        res.status(200).json(FormatResponse({ message: `${user?.firstName} is now a ADMIN.` }));
    } catch (error) {
        console.error("Delete user error:", error);
        next(error)
    }
};

// List all users with filters (Admin only)
export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { firstName, lastName, email, phone, role } = req.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                ...(firstName && { firstName: { contains: String(firstName) } }),
                ...(lastName && { lastName: { contains: String(lastName) } }),
                ...(email && { email: { contains: String(email) } }),
                ...(phone && { phone: { contains: String(phone) } }),
                ...((role === ROLES.USER || role === ROLES.ADMIN) && { role: role }),
            },
            select: {
                firstName: true,disable:true, lastName: true, email: true, phone: true, avatar: true, id: true, role: true
            }
        });

        res.status(200).json(FormatResponse({ data: users }));
    } catch (error) {
        console.error("List users error:", error);
        next(error)
    }
};
