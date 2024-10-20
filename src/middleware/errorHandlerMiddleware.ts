import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import CustomError from '../utils/customError'; // Ensure you import your CustomError class

const prisma = new PrismaClient();

const errorHandlerMiddleware = (error: any, req: Request, res: Response, next: NextFunction): void => {
    let customError = {
        statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message || "Something went wrong, please try again later",
        success: false,
    };

    if (error instanceof ZodError) {
        // Zod validation error
        res.status(400).json({ success: false, error: error.errors });
    } else if (error instanceof CustomError) {
        customError = {
            statusCode: error.status,
            message: error.message,
            success: error.success,
        };
    } else if (error.name === "CastError") {
        customError.message = `No item found with id: ${error.value}`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        switch (error.code) {
            case 'P2002':
                customError.message = 'Unique constraint violation.';
                customError.statusCode = StatusCodes.CONFLICT;
                break;
            case 'P2025':
                customError.message = 'Record not found.';
                customError.statusCode = StatusCodes.NOT_FOUND;
                break;
            default:
                customError.message = error.message;
                customError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Validation errors
        customError.message = error.message;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        // Unknown errors
        customError.message = 'An unknown Prisma error occurred.';
        customError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }

    res.status(customError.statusCode).json({ success: customError.success, message: customError.message, data: [] });
};

export default errorHandlerMiddleware;
