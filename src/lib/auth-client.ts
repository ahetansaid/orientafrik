'use client';
import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

// Client Better Auth (navigateur). OTP e-mail : envoi puis vérification.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;
