import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createLocalDriver } from './local';
import { createR2Driver } from './r2';
import { createR2BindingDriver } from './r2-binding';
import type { StorageDriver } from './types';

export type { PutObjectInput, StorageDriver, StoredObject } from './types';

/** The Worker's R2 `MEDIA` binding, or undefined outside a Worker / if unbound. */
function mediaBinding(): R2Bucket | undefined {
  if (process.env.NODE_ENV !== 'production') return undefined;
  try {
    return (getCloudflareContext().env as { MEDIA?: R2Bucket }).MEDIA;
  } catch {
    return undefined;
  }
}

/**
 * Selects the media storage driver (docs/4-architecture.md §2.2).
 *
 * - On the Worker with a MEDIA binding → R2 via the binding (no keys).
 *   R2_PUBLIC_BASE_URL is required.
 * - R2_ACCOUNT_ID set → Cloudflare R2 over the S3 API (local scripts,
 *   non-Worker hosts); every other R2_* var is required.
 * - R2_ACCOUNT_ID empty in development → local filesystem (.blob-storage/).
 * - R2_ACCOUNT_ID empty in production → throws. Writing product media to
 *   an ephemeral server disk would lose it silently.
 */
function selectDriver(): StorageDriver {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();

  if (!accountId) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Media storage is not configured: set the R2_* environment variables.');
    }
    return createLocalDriver();
  }

  const required = {
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim(),
    bucket: process.env.R2_BUCKET?.trim(),
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim(),
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`R2_ACCOUNT_ID is set but R2 config is incomplete: missing ${missing.join(', ')}.`);
  }

  return createR2Driver({
    accountId,
    accessKeyId: required.accessKeyId!,
    secretAccessKey: required.secretAccessKey!,
    bucket: required.bucket!,
    publicBaseUrl: required.publicBaseUrl!,
  });
}

let driver: StorageDriver | undefined;

/**
 * Lazily initialised so a missing config fails at first use, not at import.
 * Call inside a request: on the Worker the binding comes from the request's
 * Cloudflare context.
 */
export function getStorage(): StorageDriver {
  const bucket = mediaBinding();
  if (bucket) {
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
    if (!publicBaseUrl) {
      throw new Error('MEDIA is bound but R2_PUBLIC_BASE_URL is not set.');
    }
    return createR2BindingDriver(bucket, publicBaseUrl);
  }
  driver ??= selectDriver();
  return driver;
}
