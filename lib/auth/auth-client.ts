import { stripeClient } from "@better-auth/stripe/client";
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_BASE_URL as string,
  plugins: [
    emailOTPClient(),
    twoFactorClient(),
    stripeClient({
      subscription: true,
    }),
  ],
});
