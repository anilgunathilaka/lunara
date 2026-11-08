/**
 * Media storage contract (docs/4-architecture.md §2.1, §2.2).
 *
 * One interface, two drivers: Cloudflare R2 in deployed environments,
 * the local filesystem in development. Calling code never branches on
 * which driver is active.
 *
 * Originals are stored byte-for-byte. Nothing here resizes, re-encodes
 * or strips metadata — the embedded colour profile on product
 * photography must survive storage untouched (§4).
 */

export interface PutObjectInput {
  /** Object key, e.g. `designs/kandyan-lotus/pattern.png`. See `assertValidKey`. */
  key: string;
  body: Uint8Array;
  contentType: string;
  /** Defaults to long-lived immutable caching; keys should be content-versioned. */
  cacheControl?: string;
}

export interface StoredObject {
  key: string;
  /** Absolute (R2) or root-relative (local) URL the object is served from. */
  url: string;
}

export interface StorageDriver {
  readonly name: 'r2' | 'local';
  put(input: PutObjectInput): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

export const DEFAULT_CACHE_CONTROL = 'public, max-age=31536000, immutable';

// Lowercase path segments of letters, digits, dot, dash, underscore,
// separated by single slashes. Rejects traversal, leading slashes and
// anything that would need URL-encoding.
const KEY_PATTERN = /^[a-z0-9][a-z0-9._-]*(\/[a-z0-9][a-z0-9._-]*)*$/;

export function assertValidKey(key: string): void {
  if (key.length > 512 || !KEY_PATTERN.test(key) || key.split('/').includes('..')) {
    throw new Error(`Invalid storage key: "${key}"`);
  }
}
