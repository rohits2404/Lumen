import { cache } from "react";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { siteConfig } from "@/lib/config/site";
import { db } from "@/lib/db";
import {
    sendChangeEmailConfirmation,
    sendInvitationEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
} from "@/lib/email";

const socialProviders = {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
              github: {
                  clientId: process.env.GITHUB_CLIENT_ID,
                  clientSecret: process.env.GITHUB_CLIENT_SECRET,
              },
          }
        : {}),
};

export const auth = betterAuth({
    appName: siteConfig.name,
    database: prismaAdapter(db, { provider: "postgresql" }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            const invited = await db.userInvitation.findFirst({
                where: { email: user.email, status: "PENDING" },
                select: { id: true },
            });
            return invited
                ? sendInvitationEmail(user.email, url)
                : sendPasswordResetEmail(user.email, url);
        },
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: ({ user, url }) =>
            sendVerificationEmail(user.email, url),
    },

    socialProviders,

    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailConfirmation: ({ user, newEmail, url }) =>
                sendChangeEmailConfirmation(user.email, newEmail, url),
        },
        additionalFields: {
            intent: {
                type: "string",
                required: false,
                defaultValue: "LEARNING",
                input: true,
            },
        },
    },

    account: {
        accountLinking: {
            updateUserInfoOnLink: true,
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },

    rateLimit: {
        enabled: true,
        storage: "database",
    },

    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
    },

    plugins: [admin(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];

export const getSession = cache(async () =>
    auth.api.getSession({ headers: await headers() }),
);
