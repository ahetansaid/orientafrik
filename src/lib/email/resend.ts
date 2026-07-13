import 'server-only';
import { Resend } from 'resend';
import { serverEnv } from '@/lib/env';

export const EMAIL_FROM = 'ORIENTAFRIK <no-reply@orientafrik.bj>';

// Client Resend, ou null si non configuré (les envois deviennent alors des no-op
// silencieux — pratique en dev local sans clé).
export function getResend(): Resend | null {
  const key = serverEnv().RESEND_API_KEY;
  return key ? new Resend(key) : null;
}
