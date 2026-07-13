import Script from 'next/script';
import { clientEnv } from '@/lib/env';

// Script Plausible (privacy-friendly, sans cookie). Ne s'injecte que si un
// domaine est configuré — sinon rien, pour ne pas polluer le dev local.
export function PlausibleScript() {
  const domain = clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.tagged-events.js"
      strategy="afterInteractive"
    />
  );
}
