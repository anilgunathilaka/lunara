// Guards Worker builds against shipping secrets (docs/4-architecture.md §2.4).
//
// OpenNext copies every `.env*` file in the project root into the Worker
// bundle (.open-next/cloudflare/next-env.mjs). On a developer machine that
// would deploy the database password and API keys inside the Worker code.
//
//   node scripts/check-deploy-env.mjs pre   → fail if any .env* file exists
//   node scripts/check-deploy-env.mjs post  → fail if the built bundle holds
//                                             any env value
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const mode = process.argv[2];

function fail(message) {
  console.error(`\n✖ check-deploy-env: ${message}\n`);
  process.exit(1);
}

if (mode === 'pre') {
  const envFiles = readdirSync(root).filter(
    (name) => name.startsWith('.env') && name !== '.env.example',
  );
  if (envFiles.length > 0) {
    fail(
      `found ${envFiles.join(', ')} in the project root. OpenNext would bundle ` +
        'its values into the Worker. Deploy through CI (push to main, or run the ' +
        'workflow manually), or build from a clean checkout with no .env files.',
    );
  }
  console.log('✔ check-deploy-env: no .env files in the project root');
} else if (mode === 'post') {
  const bundled = join(root, '.open-next', 'cloudflare', 'next-env.mjs');
  if (!existsSync(bundled)) fail(`${bundled} not found — did the Worker build run?`);
  const envByMode = await import(pathToFileURL(bundled).href);
  const leaked = Object.entries(envByMode).flatMap(([envMode, vars]) =>
    Object.keys(vars ?? {}).map((key) => `${envMode}.${key}`),
  );
  if (leaked.length > 0) {
    fail(`the Worker bundle contains env values: ${leaked.join(', ')}. Do not deploy it.`);
  }
  console.log('✔ check-deploy-env: Worker bundle contains no env values');
} else {
  fail('usage: node scripts/check-deploy-env.mjs pre|post');
}
