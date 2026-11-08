import 'server-only';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assertValidKey, type PutObjectInput, type StorageDriver, type StoredObject } from './types';

/** Git-ignored dev storage root (see .gitignore). */
export const LOCAL_STORAGE_ROOT = path.join(process.cwd(), '.blob-storage');

/** Route that serves local objects in development: app/api/media/[...key]/route.ts */
export const LOCAL_MEDIA_ROUTE = '/api/media';

export function resolveLocalPath(key: string): string {
  assertValidKey(key);
  const resolved = path.resolve(LOCAL_STORAGE_ROOT, ...key.split('/'));
  // Defence in depth beyond the key pattern.
  if (!resolved.startsWith(LOCAL_STORAGE_ROOT + path.sep)) {
    throw new Error(`Storage key escapes storage root: "${key}"`);
  }
  return resolved;
}

/** Development stand-in for R2. Same interface; writes to disk. */
export function createLocalDriver(): StorageDriver {
  function publicUrl(key: string): string {
    assertValidKey(key);
    return `${LOCAL_MEDIA_ROUTE}/${key}`;
  }

  return {
    name: 'local',

    async put({ key, body }: PutObjectInput): Promise<StoredObject> {
      const filePath = resolveLocalPath(key);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, body);
      return { key, url: publicUrl(key) };
    },

    async delete(key: string): Promise<void> {
      await rm(resolveLocalPath(key), { force: true });
    },

    publicUrl,
  };
}
