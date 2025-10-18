import { z } from "zod";

/**
 * Zod validation schemas for authentication and Polar integration
 */

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")
  .max(254, "Email is too long");

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password is too long")
  .refine((password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  }, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  });

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

/**
 * Signup request validation schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
});

/**
 * Signin request validation schema
 */
export const signinSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * User creation data validation schema
 */
export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
});

/**
 * Polar customer creation validation schema
 */
export const createPolarCustomerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: nameSchema.optional(),
  externalId: z.string().min(1, "External ID is required"),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Type exports for validated data
 */
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreatePolarCustomerInput = z.infer<typeof createPolarCustomerSchema>;
