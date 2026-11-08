#!/usr/bin/env node
/**
 * Fails the build on any raw hex colour literal found outside
 * lib/tokens.css — the design system's single permitted source of
 * raw values (docs/2-ui.md §8.1, docs/3-components.md §1 rule 1).
 *
 * Run via `npm run lint:tokens` (also wired into `npm run lint`).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.open-next',
  '.wrangler',
  '.git',
  'docs',
  'content',
  'public',
  'scripts',
]);

// The one file allowed to contain raw hex values.
const ALLOWED_FILES = new Set([join(ROOT, 'lib', 'tokens.css')]);

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

/** @type {string[]} */
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath);
    } else if (SCAN_EXTENSIONS.has(extname(fullPath))) {
      if (ALLOWED_FILES.has(fullPath)) continue;
      checkFile(fullPath);
    }
  }
}

function checkFile(fullPath) {
  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const matches = line.match(HEX_PATTERN);
    if (matches) {
      violations.push(`${relative(ROOT, fullPath)}:${index + 1}  ${matches.join(', ')}`);
    }
  });
}

walk(ROOT);

if (violations.length > 0) {
  console.error('\nRaw hex value(s) found outside lib/tokens.css:\n');
  for (const v of violations) console.error('  ' + v);
  console.error(
    '\nUse a token from lib/tokens.css (e.g. var(--lun-plum)) or its Tailwind ' +
      'mapping instead. See docs/2-ui.md §8.1.\n',
  );
  process.exit(1);
} else {
  console.log('lint:tokens — no raw hex values found outside lib/tokens.css.');
}
