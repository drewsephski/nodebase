import { polarClient, polarConfig } from "./polar";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, portal } from "@polar-sh/better-auth";
import { checkout } from "@polar-sh/better-auth";
import prisma from "./db";

/**
 * Validates required environment variables for authentication
 */
function validateAuthEnvironment() {
  const required = [
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "NEXT_PUBLIC_BETTER_AUTH_URL",
    "DATABASE_URL"
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
      "Please check your .env.local file and ensure all required variables are set."
    );
  }

  // Validate URL format
  try {
    new URL(process.env.BETTER_AUTH_URL!);
    new URL(process.env.NEXT_PUBLIC_BETTER_AUTH_URL!);
  } catch {
    throw new Error(
      "BETTER_AUTH_URL and NEXT_PUBLIC_BETTER_AUTH_URL must be valid URLs. " +
      "Example: http://localhost:3000"
    );
  }

  // Validate Polar configuration if Polar is enabled
  if (polarConfig.isConfigured) {
    console.log(`✅ Polar integration configured for ${polarConfig.environment} environment`);
  } else {
    console.warn("⚠️  Polar integration not configured (POLAR_ACCESS_TOKEN not set)");
  }
}

/**
 * Better Auth configuration with Polar integration
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: polarConfig.isConfigured ? [
    polar({
      client: polarClient,
      createCustomerOnSignUp: false, // Disable automatic creation
      use: [
        checkout({
          products: [
            {
              productId: "f56e5c88-21e1-457f-9d46-10f526c69afe",
              slug: "pro",
            },
          ],
          successUrl: polarConfig.successUrl || `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard`,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ] : [], // No plugins if Polar not configured
  // Global error handler for API errors
  onAPIError: {
    throw: true,
    onError: (error: any, ctx: any) => {
      console.error("Better Auth API Error:", {
        error: error?.message || error,
        status: error?.status,
        path: ctx?.path || "unknown",
        method: ctx?.method || "unknown",
      });
    },
  },
});

// Validate environment on module load
validateAuthEnvironment();
