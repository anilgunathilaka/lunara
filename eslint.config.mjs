import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      'cloudflare-env.d.ts',
      'docs/**',
    ],
  },
  {
    rules: {
      // Design-system discipline: raw hex is caught by scripts/check-tokens.mjs
      // (npm run lint:tokens) rather than an ESLint rule, since it must also
      // scan .css files. Keep the two checks separate so each stays simple.
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            'Raw hex literal found. Use a design token from lib/tokens.css instead (see docs/2-ui.md §8.1).',
        },
      ],
    },
  },
];

export default eslintConfig;
