import { ImageResponse } from 'next/og';

// Icône iOS (apple-touch-icon) générée en PNG — Safari ne rend pas bien le SVG.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            border: '9px solid #d9a63a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f7f8fb',
            fontSize: 54,
            fontWeight: 800,
          }}
        >
          O
        </div>
      </div>
    ),
    size,
  );
}
