import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { emailHarmony } from 'better-auth-harmony';
import { db } from '@/db';
import * as schema from '@/db/schema/auth';
import { sendEmail } from '@/lib/email';
import { getURL } from '@/lib/utils';

export const auth = betterAuth({
  appName: 'NextDay',
  baseURL: getURL(),
  database: drizzleAdapter(db, {
    // provider: 'sqlite',
    provider: 'pg',
    schema: schema,
    usePlural: true,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
        `,
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        html: `
          <h1>Welcome to NextDay!</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
          <p>If you didn't request this verification, you can safely ignore this email.</p>
        `,
        text: `Welcome to NextDay! Click the link to verify your email: ${url}`,
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendEmail({
          to: newEmail,
          subject: 'Verify your new email address',
          html: `
            <h1>Verify your new email address</h1>
            <p>Please click the link below to verify your new email address:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
            <p>If you didn't request this verification, you can safely ignore this email.</p>
          `,
          text: `Click the link to verify your new email: ${url}`,
        });
      },
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ['google', 'github'],
    },
  },
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
  plugins: [nextCookies(), emailHarmony()],
});
