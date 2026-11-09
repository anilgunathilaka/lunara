import 'server-only';
import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

/**
 * Shared shape of ops form actions (docs/4-architecture.md §3.5): validate,
 * write, then return to the page with ?saved=1 or ?error=<code>. Used by the
 * newer ops action files; lib/ops/actions.ts keeps its own copy.
 */

export type OpsErrorCode = 'invalid' | 'conflict' | 'exists' | 'inUse' | 'sold' | 'notFound';

export class OpsError extends Error {
  constructor(readonly code: OpsErrorCode) {
    super(code);
  }
}

export const opsLocale = z.enum(['en', 'si', 'ta']);

export function langOf(form: FormData): 'en' | 'si' | 'ta' {
  return opsLocale.safeParse(form.get('locale')).data ?? 'en';
}

/** Back to a page built from validated parts, with the outcome in the query string. */
export function back(path: string, outcome: { error?: OpsErrorCode } = {}): never {
  revalidatePath(path);
  const join = path.includes('?') ? '&' : '?';
  redirect((outcome.error ? `${path}${join}error=${outcome.error}` : `${path}${join}saved=1`) as Route);
}

/** Runs the work; an OpsError returns to `path` with its code, success goes to `done` (default `path`). */
export async function run(path: string, work: () => Promise<string | void>): Promise<never> {
  let done: string | void;
  try {
    done = await work();
  } catch (error) {
    if (error instanceof OpsError) back(path, { error: error.code });
    throw error;
  }
  back(done ?? path);
}

/** "Rose Dust Border" → "rose-dust-border". Non-Latin names fall back to a short random id. */
export function slugify(text: string, max = 40): string {
  const slug = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');
  return slug || `item-${Math.random().toString(36).slice(2, 7)}`;
}

/** Short upper-case code for SKUs: "rose-dust" → "ROSEDUST". */
export function skuCode(text: string, max = 8): string {
  return slugify(text).replace(/-/g, '').toUpperCase().slice(0, max) || 'X';
}

/** base, base-2, base-3 … until `taken` says no. */
export async function uniqueValue(base: string, taken: (value: string) => Promise<boolean>, sep = '-'): Promise<string> {
  if (!(await taken(base))) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}${sep}${n}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new OpsError('conflict');
}

/** Checkbox value from a form. */
export const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === '1', z.boolean());
