// validation/userValidation.ts
import { z } from 'zod';

// Registration schema
export const UserRegistrationSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"), // Adjust based on your phone format
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// Login schema
export const UserLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// Update user schema
export const UserUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  }),
});
