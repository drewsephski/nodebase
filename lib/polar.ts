import { Polar } from "@polar-sh/sdk";

/**
 * Polar client configuration with environment variable validation
 */
function createPolarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";

  // Validate required environment variables
  if (!accessToken) {
    throw new Error(
      "POLAR_ACCESS_TOKEN environment variable is required. " +
      "Please set it in your .env.local file. " +
      "You can get this from your Polar dashboard at https://polar.sh/dashboard"
    );
  }

  if (accessToken.length < 10) {
    throw new Error(
      "POLAR_ACCESS_TOKEN appears to be invalid (too short). " +
      "Please ensure you've copied the complete token from your Polar dashboard."
    );
  }

  // Validate token format (basic check)
  if (!accessToken.startsWith("polar_")) {
    console.warn(
      "Warning: POLAR_ACCESS_TOKEN should start with 'polar_'. " +
      "Please verify this is the correct token from your Polar dashboard."
    );
  }

  return new Polar({
    accessToken,
    server: isProduction ? "production" : "sandbox",
  });
}

export const polarClient = createPolarClient();

/**
 * Environment variables validation for Polar integration
 */
export const polarConfig = {
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  successUrl: process.env.POLAR_SUCCESS_URL,
  isConfigured: !!process.env.POLAR_ACCESS_TOKEN,
} as const;
