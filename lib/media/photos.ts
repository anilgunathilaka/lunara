import 'server-only';
import { randomBytes } from 'node:crypto';
import { getStorage } from '@/lib/storage';

/**
 * Product photography (docs/4-architecture.md §4, §3.7). Photos are stored
 * byte-for-byte: no resize, re-encode or metadata strip here, so the
 * embedded colour profile survives. The database holds the storage KEY; the
 * URL is resolved on read, so moving media to a custom domain needs no data
 * change.
 */

export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
export const MAX_GALLERY_PHOTOS = 8;

export type PhotoKind = 'gallery' | 'reference' | 'swatch' | 'review';

const FORMATS = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const;
export type PhotoFormat = keyof typeof FORMATS;

/** Identify the format from the file's own bytes, never from its name or the browser's claim. */
export function sniffPhoto(bytes: Uint8Array): { ext: PhotoFormat; contentType: string } | null {
  const at = (i: number) => bytes[i] ?? -1;
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { ext: 'jpg', contentType: FORMATS.jpg };
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => at(i) === b)) {
    return { ext: 'png', contentType: FORMATS.png };
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { ext: 'webp', contentType: FORMATS.webp };
  return null;
}

/** Storage-safe segment from a record id (lib/storage key rules). */
function segment(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[^a-z0-9]+/, '') || 'x';
}

/**
 * A new key per upload, so cached copies never go stale (immutable caching).
 * Random rather than a content hash: hashing a large photo would spend the
 * Worker's CPU budget for nothing.
 */
export function photoKey(kind: PhotoKind, ownerId: string, ext: PhotoFormat): string {
  const stamp = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
  // Customer review photos live apart from product photography.
  if (kind === 'review') return `reviews/${segment(ownerId)}/${stamp}.${ext}`;
  const owner = kind === 'swatch' ? `jackets/${segment(ownerId)}` : `sarees/${segment(ownerId)}`;
  return `${owner}/${kind}/${stamp}.${ext}`;
}

/** URL for a stored key. Values that are already URLs or site paths pass through. */
export function mediaUrl(keyOrUrl: string): string {
  if (/^(https?:)?\//.test(keyOrUrl)) return keyOrUrl;
  return getStorage().publicUrl(keyOrUrl);
}

export function mediaUrlOr(keyOrUrl: string | null | undefined, fallback: string): string {
  return keyOrUrl ? mediaUrl(keyOrUrl) : fallback;
}
