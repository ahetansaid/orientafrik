import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { PlausibleScript } from '@/lib/analytics/plausible';
import { ServiceWorkerRegister } from '@/shared/ui/ServiceWorkerRegister';
import { InstallPrompt } from '@/shared/ui/InstallPrompt';
import { MARQUE, SLOGAN } from '@/shared/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${MARQUE} — ${SLOGAN}`, template: `%s · ${MARQUE}` },
  description:
    "Plateforme d'orientation post-bac au Bénin : profil, plan de parcours, écoles et bourses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  applicationName: MARQUE,
  appleWebApp: { capable: true, statusBarStyle: 'default', title: MARQUE },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#12224a',
  colorScheme: 'light',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  return (
    <html lang={locale}>
      <head>
        <PlausibleScript />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <ServiceWorkerRegister />
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
