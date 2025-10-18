/**
 * @fileoverview TypeScript type definitions for authentication and Polar integration
 *
 * This file contains all the type definitions used throughout the authentication
 * system, including Better Auth integration, Polar customer management, and
 * API response types.
 *
 * @author N8N Clone Team
 * @version 1.0.0
 */

/**
 * Extended user type with Polar customer information
 *
 * This interface extends the base user model to include Polar-specific fields
 * for customer relationship management.
 *
 * Note: Prisma User model needs to be extended with polarCustomerId field
 *
 * @interface UserWithPolar
 */
export interface UserWithPolar {
  /** Unique identifier for the user */
  id: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Whether the user's email has been verified */
  emailVerified: boolean;
  /** User's profile image URL (optional) */
  image?: string | null;
  /** Polar customer ID for billing integration (optional) */
  polarCustomerId?: string | null;
  /** Account creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Better Auth API error type
 */
export interface BetterAuthError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Environment configuration validation result
 */
export interface EnvironmentValidation {
  isValid: boolean;
  missingVariables: string[];
  warnings: string[];
}

/**
 * Polar integration configuration
 */
export interface PolarConfig {
  accessToken?: string;
  environment: "sandbox" | "production";
  successUrl?: string;
  isConfigured: boolean;
}

/**
 * Auth API response types (Better Auth)
 */
export interface AuthSignUpResult {
  user: UserWithPolar;
  token?: any;
}

export interface AuthSignInResult {
  user: UserWithPolar;
  session: any;
}

/**
 * Polar customer types
 */
export interface PolarCustomer {
  id: string;
  external_id?: string;
  email: string;
  name?: string;
  created_at: string;
  modified_at?: string;
  metadata?: Record<string, any>;
}

/**
 * Polar subscription types
 */
export interface PolarSubscription {
  id: string;
  customer_id: string;
  product_id: string;
  status: "active" | "canceled" | "past_due" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * API response wrapper types
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Auth fallback response types
 */
export interface AuthFallbackResult {
  success: boolean;
  message?: string;
  user?: UserWithPolar;
  session?: any;
  error?: string;
}

/**
 * Signup eligibility check result
 */
export interface SignupEligibility {
  canSignup: boolean;
  reason?: "existing_polar_customer" | "system_error";
  polarCustomer?: any;
}

/**
 * Polar customer creation data
 */
export interface CreatePolarCustomerData {
  email: string;
  name?: string;
  externalId: string;
  metadata?: Record<string, any>;
}

/**
 * Polar customer lookup result
 */
export interface PolarCustomerResult {
  success: boolean;
  customerId?: string;
  customer?: any;
}

/**
 * Better Auth API error type
 */
export interface BetterAuthError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Environment configuration validation result
 */
export interface EnvironmentValidation {
  isValid: boolean;
  missingVariables: string[];
  warnings: string[];
}

/**
 * Polar integration configuration
 */
export interface PolarConfig {
  accessToken?: string;
  environment: "sandbox" | "production";
  successUrl?: string;
  isConfigured: boolean;
}

/**
 * Auth API response types (Better Auth)
 */
export interface AuthSignUpResult {
  user: UserWithPolar;
  session: any;
}

export interface AuthSignInResult {
  user: UserWithPolar;
  session: any;
}

/**
 * Polar customer types
 */
export interface PolarCustomer {
  id: string;
  external_id?: string;
  email: string;
  name?: string;
  created_at: string;
  modified_at?: string;
  metadata?: Record<string, any>;
}

/**
 * Polar subscription types
 */
export interface PolarSubscription {
  id: string;
  customer_id: string;
  product_id: string;
  status: "active" | "canceled" | "past_due" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * API response wrapper types
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
