"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdateSchema = exports.UserLoginSchema = exports.UserRegistrationSchema = void 0;
// validation/userValidation.ts
const zod_1 = require("zod");
// Registration schema
exports.UserRegistrationSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, "First name is required"),
        lastName: zod_1.z.string().min(1, "Last name is required"),
        email: zod_1.z.string().email("Invalid email format"),
        phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits"), // Adjust based on your phone format
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    }),
});
// Login schema
exports.UserLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    }),
});
// Update user schema
exports.UserUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, "First name is required").optional(),
        lastName: zod_1.z.string().min(1, "Last name is required").optional(),
        email: zod_1.z.string().email("Invalid email format").optional(),
        phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits").optional(),
    }),
});
