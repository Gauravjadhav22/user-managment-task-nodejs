"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const customError_1 = __importDefault(require("../utils/customError")); // Ensure you import your CustomError class
const prisma = new client_1.PrismaClient();
const errorHandlerMiddleware = (error, req, res, next) => {
    let customError = {
        statusCode: error.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message || "Something went wrong, please try again later",
        success: false,
    };
    if (error instanceof zod_1.ZodError) {
        // Zod validation error
        res.status(400).json({ success: false, error: error.errors });
    }
    else if (error instanceof customError_1.default) {
        customError = {
            statusCode: error.status,
            message: error.message,
            success: error.success,
        };
    }
    else if (error.name === "CastError") {
        customError.message = `No item found with id: ${error.value}`;
        customError.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        switch (error.code) {
            case 'P2002':
                customError.message = 'Unique constraint violation.';
                customError.statusCode = http_status_codes_1.StatusCodes.CONFLICT;
                break;
            case 'P2025':
                customError.message = 'Record not found.';
                customError.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
                break;
            default:
                customError.message = error.message;
                customError.statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        // Validation errors
        customError.message = error.message;
        customError.statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
    else if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        // Unknown errors
        customError.message = 'An unknown Prisma error occurred.';
        customError.statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    }
    res.status(customError.statusCode).json({ success: customError.success, message: customError.message, data: [] });
};
exports.default = errorHandlerMiddleware;
