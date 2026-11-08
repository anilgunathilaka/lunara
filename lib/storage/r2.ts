import 'server-only';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  DEFAULT_CACHE_CONTROL,
  assertValidKey,
  type PutObjectInput,
  type StorageDriver,
  type StoredObject,
} from './types';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** e.g. https://media.lunarasarees.lk — no trailing slash. */
  publicBaseUrl: string;
}

/** Cloudflare R2 via its S3-compatible API. Server-side only. */
export function createR2Driver(config: R2Config): StorageDriver {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const publicBaseUrl = config.publicBaseUrl.replace(/\/+$/, '');

  function publicUrl(key: string): string {
    assertValidKey(key);
    return `${publicBaseUrl}/${key}`;
  }

  return {
    name: 'r2',

    async put({ key, body, contentType, cacheControl }: PutObjectInput): Promise<StoredObject> {
      assertValidKey(key);
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: cacheControl ?? DEFAULT_CACHE_CONTROL,
        }),
      );
      return { key, url: publicUrl(key) };
    },

    async delete(key: string): Promise<void> {
      assertValidKey(key);
      await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    },

    publicUrl,
  };
}
