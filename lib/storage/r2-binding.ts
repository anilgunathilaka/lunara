import 'server-only';
import {
  DEFAULT_CACHE_CONTROL,
  assertValidKey,
  type PutObjectInput,
  type StorageDriver,
  type StoredObject,
} from './types';

/**
 * Cloudflare R2 through a Worker binding (docs/4-architecture.md §2.2).
 * Used on the Worker: no API keys, the binding is the credential.
 * Objects are stored byte-for-byte — no processing, so the embedded colour
 * profile survives.
 */
export function createR2BindingDriver(bucket: R2Bucket, publicBaseUrl: string): StorageDriver {
  const base = publicBaseUrl.replace(/\/+$/, '');

  function publicUrl(key: string): string {
    assertValidKey(key);
    return `${base}/${key}`;
  }

  return {
    name: 'r2',

    async put({ key, body, contentType, cacheControl }: PutObjectInput): Promise<StoredObject> {
      assertValidKey(key);
      await bucket.put(key, body, {
        httpMetadata: { contentType, cacheControl: cacheControl ?? DEFAULT_CACHE_CONTROL },
      });
      return { key, url: publicUrl(key) };
    },

    async delete(key: string): Promise<void> {
      assertValidKey(key);
      await bucket.delete(key);
    },

    publicUrl,
  };
}
