import { z } from 'zod';
import { getStaff } from '@/lib/ops/staff';
import { getPrisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { MAX_GALLERY_PHOTOS, MAX_PHOTO_BYTES, photoKey, sniffPhoto } from '@/lib/media/photos';

/**
 * Staff photo upload (docs/4-architecture.md §3.7). The request body IS the
 * file — no multipart parsing, so a phone-sized photo costs the Worker
 * almost no CPU. Stored byte-for-byte (§4).
 *
 *   POST /api/ops/media?kind=gallery|reference|swatch&id=<colourway id>
 *   Content-Type: image/jpeg | image/png | image/webp
 *
 * Staff only. Same-origin only: a cross-site page cannot send an image
 * body without a CORS preflight, which this route never approves, and the
 * Origin header is checked as well.
 */

const query = z.object({
  kind: z.enum(['gallery', 'reference', 'swatch']),
  id: z.string().min(1).max(100),
});

type UploadError = 'invalid' | 'notFound' | 'tooLarge' | 'format' | 'full' | 'locked';

function fail(error: UploadError, status: number): Response {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const staff = await getStaff();
  if (!staff) return new Response('Not found', { status: 404 });

  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return fail('invalid', 403);

  const params = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!params.success) return fail('invalid', 400);
  const { kind, id } = params.data;

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_PHOTO_BYTES) return fail('tooLarge', 413);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0) return fail('invalid', 400);
  if (bytes.length > MAX_PHOTO_BYTES) return fail('tooLarge', 413);
  const format = sniffPhoto(bytes);
  if (!format) return fail('format', 415);

  const prisma = getPrisma();

  // Refuse before storing anything when the target can't take the photo.
  if (kind === 'swatch') {
    if (!(await prisma.jacketColourway.findUnique({ where: { id }, select: { id: true } }))) return fail('notFound', 404);
  } else {
    const row = await prisma.sareeColourway.findUnique({ where: { id }, select: { galleryAssets: true, referenceFrameUrl: true } });
    if (!row) return fail('notFound', 404);
    if (kind === 'gallery' && row.galleryAssets.length >= MAX_GALLERY_PHOTOS) return fail('full', 409);
    if (kind === 'reference' && row.referenceFrameUrl) return fail('locked', 409);
  }

  const storage = getStorage();
  const key = photoKey(kind, id, format.ext);
  await storage.put({ key, body: bytes, contentType: format.contentType });

  try {
    await prisma.$transaction(async (tx) => {
      let before: unknown = null;
      if (kind === 'swatch') {
        // The previous swatch object is kept (archive); the audit row records it.
        const row = await tx.jacketColourway.findUnique({ where: { id }, select: { swatchUrl: true } });
        before = row?.swatchUrl ?? null;
        await tx.jacketColourway.update({ where: { id }, data: { swatchUrl: key } });
      } else if (kind === 'reference') {
        // Write-once (§4): only fills an empty reference frame, even under a race.
        const { count } = await tx.sareeColourway.updateMany({ where: { id, referenceFrameUrl: null }, data: { referenceFrameUrl: key } });
        if (count !== 1) throw new LockedError();
      } else {
        await tx.sareeColourway.update({ where: { id }, data: { galleryAssets: { push: key } } });
      }
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: `photo.${kind}`,
          entityType: kind === 'swatch' ? 'jacket_colourway' : 'saree_colourway',
          entityId: id,
          before: before === null ? undefined : { value: before as string },
          after: { key, bytes: bytes.length, contentType: format.contentType },
        },
      });
    });
  } catch (error) {
    // Nothing points at the new object: remove it rather than leave an orphan.
    await storage.delete(key).catch(() => undefined);
    if (error instanceof LockedError) return fail('locked', 409);
    throw error;
  }

  return Response.json({ ok: true, key, url: storage.publicUrl(key) });
}

class LockedError extends Error {}
