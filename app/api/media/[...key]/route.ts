import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStorage } from '@/lib/storage';
import { resolveLocalPath } from '@/lib/storage/local';

/**
 * Serves objects from the local dev storage driver (.blob-storage/).
 * In any environment using R2 — and always in production — media is
 * served from R2's public URL and this route returns 404.
 */

// Raster images and JSON (placement maps) only. SVG and HTML are
// deliberately excluded: served same-origin they could execute script.
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.json': 'application/json',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  if (process.env.NODE_ENV === 'production' || getStorage().name !== 'local') {
    return new Response('Not found', { status: 404 });
  }

  const key = (await params).key.join('/');
  const contentType = CONTENT_TYPES[path.extname(key).toLowerCase()];
  if (!contentType) {
    return new Response('Not found', { status: 404 });
  }

  let filePath: string;
  try {
    filePath = resolveLocalPath(key);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await readFile(filePath);
    return new Response(new Uint8Array(body), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
