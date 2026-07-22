'use client';
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}
const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false; // on suppose l'animation OK côté serveur

// Fond du hero : vidéo en autoplay muet/boucle, avec dégradés navy pour la
// lisibilité du texte. Respecte prefers-reduced-motion (affiche le poster fixe).
export function HeroBackground() {
  const reduire = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-navy">
      {reduire ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/video/hero-poster.jpg" alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-poster.jpg"
        >
          <source src="/video/hero-orientation.mp4" type="video/mp4" />
        </video>
      )}
      {/* voile navy pour contraste du texte */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-navy/50" />
    </div>
  );
}
