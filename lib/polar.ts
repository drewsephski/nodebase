import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  server: process.env.NODE_ENV !== "production" ? "sandbox" : "production",
});
