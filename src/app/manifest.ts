import type { MetadataRoute } from 'next';
import { MARQUE, SLOGAN } from '@/shared/lib/constants';

// Manifest PWA — rend l'application installable (écran d'accueil, plein écran).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${MARQUE} — ${SLOGAN}`,
    short_name: MARQUE,
    description:
      "Ton orientation post-bac au Bénin : plan de parcours, écoles et bourses faits pour toi.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f8fb',
    theme_color: '#12224a',
    lang: 'fr',
    categories: ['education'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
