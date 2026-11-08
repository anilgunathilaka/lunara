import 'server-only';
import { createLocalDriver } from './local';
import { createR2Driver } from './r2';
import type { StorageDriver } from './types';

export type { PutObjectInput, StorageDriver, StoredObject } from './types';

/**
 * Selects the media storage driver (docs/4-architecture.md §2.2).
 *
 * - R2_ACCOUNT_ID set → Cloudflare R2; every other R2_* var is required.
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

/** Lazily initialised so a missing config fails at first use, not at import. */
export function getStorage(): StorageDriver {
  driver ??= selectDriver();
  return driver;
}
