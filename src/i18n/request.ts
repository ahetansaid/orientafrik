import { getRequestConfig } from 'next-intl/server';

// MVP mono-locale (fr). La structure par namespace de feature permet d'ajouter
// les locales UEMOA plus tard sans refactor. Aucun préfixe de locale dans l'URL
// pour l'instant : on renvoie simplement les messages français.
export const LOCALE = 'fr' as const;

export default getRequestConfig(async () => {
  return {
    locale: LOCALE,
    messages: (await import('@/i18n/messages/fr.json')).default,
    timeZone: 'Africa/Porto-Novo',
  };
});
