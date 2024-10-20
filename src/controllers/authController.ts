// controllers/authController.ts
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";
import { ROLES } from "../constants";
import CustomError from "../utils/customError";

const prisma = new PrismaClient();

// Register function
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { firstName, lastName, email, phone, password, passcode = '',avatar='' } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new CustomError({ message: "User already exists with this email", status: 400 }));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    let user: User
    console.log(passcode, process.env.ADMIN_PASSCODE);

    if (passcode === process.env.ADMIN_PASSCODE) {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          role: ROLES.ADMIN,
          avatar
        },
      });
    }
    else {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          role: ROLES.USER,
          avatar
        },
      });
    }


    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
     data:{ user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar:user.avatar
      }},
      message:"user created successfully"
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error)
  }
};

// Login function
export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new CustomError({ message: "User not found", status: 404 }));
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password || '');
    if (!isPasswordValid) {
      return next(new CustomError({ message: "Invalid password", status: 401 }));

    }

    console.log(user);


    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      data:{user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar:user.avatar
      }},
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error)
  }
};
