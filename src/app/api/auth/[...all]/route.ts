import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Endpoint Better Auth (sign-in OTP, session, sign-out…).
export const { GET, POST } = toNextJsHandler(auth);
