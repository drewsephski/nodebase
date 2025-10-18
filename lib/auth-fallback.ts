import { auth } from "./auth";
import { polarSync } from "./polar-sync";
import prisma from "./db";
import { Logger } from "./logger";
import { APIError } from "better-auth/api";
import type {
  AuthFallbackResult,
  SignupEligibility,
  BetterAuthError,
  UserWithPolar
} from "./auth-types";

/**
 * Authentication fallback utilities for handling Polar customer integration
 */
export const authFallback = {
  /**
   * Handle signup with Polar customer fallback
   * Uses proper Better Auth error handling with APIError for type-safe error management
   */
  async signupWithFallback(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthFallbackResult> {
    try {
      Logger.info("Attempting signup with fallback", { email });

      // Try normal signup first
      try {
        const signupResult = await auth.api.signUpEmail({
          body: { email, password, name: name || email }
        });

        return {
          success: true,
          message: "Account created successfully",
          user: signupResult.user as UserWithPolar
        };
      } catch (signupError) {
        // Use Better Auth APIError for proper error handling
        if (signupError instanceof APIError) {
          // Check if it's a Polar customer exists error
          if (signupError.message.includes("customer with this email address already exists")) {
            Logger.warn("Polar customer exists, attempting fallback", { email });

            // Create user without Polar integration
            const user = await prisma.user.create({
              data: {
                id: crypto.randomUUID(),
                email,
                name: name || email,
              }
            });

            // Link existing Polar customer
            const linkResult = await polarSync.handleExistingCustomer(email, user.id);

            if (linkResult.success) {
              Logger.info("Successfully linked existing Polar customer", {
                email,
                customerId: linkResult.customerId
              });

              // Sign in the user
              const session = await auth.api.signInEmail({
                body: { email, password }
              });

              return {
                success: true,
                message: "Account created with existing Polar customer",
                user,
                session
              };
            }
          }
        }

        // Re-throw the error if it's not a handled case
        throw signupError;
      }
    } catch (error) {
      Logger.error("Signup with fallback failed", { email, error });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },

  /**
   * Check if user can proceed with signup
   * Returns detailed information about signup eligibility and existing Polar customers
   */
  async canSignup(email: string): Promise<SignupEligibility> {
    try {
      const polarCustomerExists = await polarSync.customerExists(email);

      if (polarCustomerExists) {
        const customer = await polarSync.getCustomerByEmail(email);
        return {
          canSignup: true,
          reason: "existing_polar_customer",
          polarCustomer: customer
        };
      }

      return { canSignup: true };
    } catch (error) {
      Logger.error("Error checking signup eligibility", { email, error });
      return {
        canSignup: false,
        reason: "system_error"
      };
    }
  }
};
