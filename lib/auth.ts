import { polarClient } from "./polar";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, portal } from "@polar-sh/better-auth";
import { checkout } from "@polar-sh/better-auth";
import prisma from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "f56e5c88-21e1-457f-9d46-10f526c69afe",
              slug: "pro",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
