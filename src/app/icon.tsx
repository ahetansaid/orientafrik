import { ImageResponse } from 'next/og';

// Favicon généré en PNG (lisible à petite taille dans tous les navigateurs).
// Marque : « O » or sur fond navy dégradé. Cohérent avec l'apple-icon.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #16274f, #0e1b3a)',
          borderRadius: 7,
          color: '#e7b84e',
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        O
      </div>
    ),
    size,
  );
}
