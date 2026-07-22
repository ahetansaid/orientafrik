import 'server-only';
import { MARQUE } from '@/shared/lib/constants';

// Envoi du code de connexion (OTP). Priorité : SMTP (ex. Gmail) → Resend → console.
// Aucune exception ne remonte au client : on logge et on laisse Better Auth suivre.

function sujet() {
  return `Ton code de connexion ${MARQUE}`;
}

function texte(otp: string) {
  return `Ton code de connexion ${MARQUE} est : ${otp}\nIl expire dans 10 minutes.\n\nSi tu n'es pas à l'origine de cette demande, ignore cet email.`;
}

// Email HTML sobre et brandé (navy/or), sans dépendance externe.
function html(otp: string) {
  const chiffres = otp
    .split('')
    .map(
      (c) =>
        `<span style="display:inline-block;min-width:38px;margin:0 3px;padding:10px 0;border-radius:10px;background:#f1f5f9;color:#12224a;font-size:24px;font-weight:800;text-align:center;font-family:monospace;">${c}</span>`,
    )
    .join('');

  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f7f8fb;padding:24px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <tr><td style="background:#12224a;padding:22px 28px;color:#ffffff;font-size:18px;font-weight:800;">
        ${MARQUE} <span style="color:#b8860b;">·</span> <span style="font-weight:600;color:#cbd5e1;font-size:14px;">Orientation post-bac</span>
      </td></tr>
      <tr><td style="padding:32px 28px;">
        <p style="margin:0 0 6px;color:#12224a;font-size:18px;font-weight:700;">Ton code de connexion</p>
        <p style="margin:0 0 22px;color:#64748b;font-size:14px;line-height:1.5;">Saisis ce code pour te connecter. Il expire dans 10 minutes.</p>
        <div style="text-align:center;margin:0 0 22px;">${chiffres}</div>
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">
        © ${MARQUE} · Cotonou, Bénin
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function envoyerOTP(email: string, otp: string): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, RESEND_API_KEY } = process.env;

  // 1) SMTP (Gmail & co).
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const nodemailer = await import('nodemailer');
    const port = Number(SMTP_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL implicite ; 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transport.sendMail({
      from: EMAIL_FROM ?? `${MARQUE} <${SMTP_USER}>`,
      to: email,
      subject: sujet(),
      text: texte(otp),
      html: html(otp),
    });
    return;
  }

  // 2) Resend (repli).
  if (RESEND_API_KEY) {
    const { Resend } = await import('resend');
    await new Resend(RESEND_API_KEY).emails.send({
      from: EMAIL_FROM ?? 'ORIENTAFRIK <no-reply@orientafrik.bj>',
      to: email,
      subject: sujet(),
      text: texte(otp),
      html: html(otp),
    });
    return;
  }

  // 3) Dev sans email configuré : on logge le code (jamais en production réelle).
  console.info(`[OTP] ${email} → ${otp}`);
}
