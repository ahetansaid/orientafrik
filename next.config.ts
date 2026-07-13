import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer doit rester hors du bundle serveur (raison du rejet de Puppeteer).
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      // Supabase Storage (logos écoles, assets). Domaine injecté à l'exécution via env.
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // typedRoutes : à réactiver quand toutes les routes des 4 côtés existeront
  // (il vérifie aussi les cibles dynamiques de redirect(), ce qui frotte pendant
  // le build incrémental par vagues). typedRoutes: true,
};

const withIntl = withNextIntl(nextConfig);

// Sentry n'enrobe la config que si le DSN est présent (évite le bruit en dev local).
export default process.env.SENTRY_DSN
  ? withSentryConfig(withIntl, {
      silent: true,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : withIntl;
