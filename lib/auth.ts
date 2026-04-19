import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import { sendAuthEmail } from "@/lib/email";

const configuredSocialProviders = {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
              google: {
                  clientId: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              },
          }
        : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
              github: {
                  clientId: process.env.GITHUB_CLIENT_ID,
                  clientSecret: process.env.GITHUB_CLIENT_SECRET,
              },
          }
        : {}),
};

const configuredTrustedProviders = Object.keys(configuredSocialProviders);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-change-me",
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        autoSignIn: false,
        sendResetPassword: async ({ user, url }) => {
            await sendAuthEmail({
                to: user.email,
                subject: "Reset your DBConnect password",
                text: `Reset your password by opening: ${url}`,
                html: `<p>Reset your password by opening <a href="${url}">this link</a>.</p>`,
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendAuthEmail({
                to: user.email,
                subject: "Verify your DBConnect email",
                text: `Verify your email by opening: ${url}`,
                html: `<p>Verify your email by opening <a href="${url}">this link</a>.</p>`,
            });
        },
    },
    socialProviders: configuredSocialProviders,
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: configuredTrustedProviders,
        },
    },
    user: {
        changeEmail: {
            enabled: false,
        },
    },
    trustedOrigins: [new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000").origin],
});
