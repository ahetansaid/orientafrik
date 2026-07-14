import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Next 16 expose des configs flat natives : on les compose directement,
// sans FlatCompat (qui plantait avec eslintrc 3.x + eslint 9.39).
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'src/lib/supabase/types.ts',
      'next-env.d.ts',
      // Specs Playwright : lint dédié via Playwright, hors règles applicatives Next.
      'tests/e2e/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // react-pdf n'est pas react-dom : il ne décode pas les entités HTML, donc
    // escaper les apostrophes françaises casserait le rendu. Règle non pertinente ici.
    files: ['src/features/*/pdf/**/*.{ts,tsx}'],
    rules: { 'react/no-unescaped-entities': 'off' },
  },
  {
    // Frontière d'architecture : l'UI ne parle jamais directement à la couche data.
    // Elle passe par les actions (server) ou reçoit ses données en props.
    files: ['src/features/*/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/data/**', '@/features/*/data/**'],
              message:
                "L'UI ne doit pas importer la couche data directement — passer par une action serveur ou recevoir les données en props.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
