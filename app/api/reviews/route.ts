import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { photoKey, sniffPhoto } from '@/lib/media/photos';
import { getPrisma } from '@/lib/prisma';
import { verifyReviewSignature } from '@/lib/reviews/link';
import {
  MAX_REVIEW_PHOTOS,
  MAX_REVIEW_PHOTO_BYTES,
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  isReviewable,
} from '@/lib/reviews/reviews';
import { getStorage } from '@/lib/storage';

/**
 * Review submission (docs/4-architecture.md §3.8). A plain multipart form
 * post from /[locale]/review/[number], so it works without JavaScript; the
 * runtime's native form parser does the work. Answers with a redirect back
 * to the review page carrying ?done=<line> or ?error=<code>.
 *
 * Proof of purchase is the signed link (lib/reviews/link.ts); one review per
 * order line, enforced by a unique key.
 */

const fields = z.object({
  locale: z.enum(['en', 'si', 'ta']),
  number: z.string().regex(/^LUN-[A-Z0-9]{6}$/),
  s: z.string().length(32),
  lineId: z.string().min(1).max(100),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(REVIEW_BODY_MIN).max(REVIEW_BODY_MAX),
  displayName: z.string().trim().min(1).max(40),
});

type ReviewError = 'invalid' | 'link' | 'notYet' | 'exists' | 'photoFormat' | 'photoSize' | 'photoCount';

export async function POST(request: Request): Promise<Response> {
  const self = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  // Browsers send Origin on form posts; a different one is a cross-site post.
  if (origin && origin !== self) return new Response('Forbidden', { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const locale = z.enum(['en', 'si', 'ta']).safeParse(form.get('locale')).data ?? 'en';
  const number = String(form.get('number') ?? '');
  const signature = String(form.get('s') ?? '');
  if (!verifyReviewSignature(number, signature)) return new Response('Not found', { status: 404 });

  const page = `${self}/${locale}/review/${number}?s=${encodeURIComponent(signature)}`;
  const back = (outcome: { error?: ReviewError; done?: string }) =>
    Response.redirect(outcome.error ? `${page}&error=${outcome.error}` : `${page}&done=${encodeURIComponent(outcome.done ?? '')}`, 303);

  const parsed = fields.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string')));
  if (!parsed.success) return back({ error: 'invalid' });
  const input = parsed.data;

  const files = form.getAll('photos').filter((v): v is File => typeof v !== 'string' && v.size > 0);
  if (files.length > MAX_REVIEW_PHOTOS) return back({ error: 'photoCount' });
  if (files.some((f) => f.size > MAX_REVIEW_PHOTO_BYTES)) return back({ error: 'photoSize' });

  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { number: input.number },
    select: { id: true, status: true, district: true, lines: { select: { id: true, listingId: true, review: { select: { id: true } } } } },
  });
  if (!order) return back({ error: 'link' });
  if (!isReviewable(order.status)) return back({ error: 'notYet' });
  const line = order.lines.find((l) => l.id === input.lineId);
  if (!line) return back({ error: 'invalid' });
  if (line.review) return back({ error: 'exists' });

  // Check every photo before storing any of them.
  const photos: { bytes: Uint8Array; ext: 'jpg' | 'png' | 'webp'; contentType: string }[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = sniffPhoto(bytes);
    if (!format) return back({ error: 'photoFormat' });
    photos.push({ bytes, ...format });
  }

  const storage = getStorage();
  const keys: string[] = [];
  try {
    for (const photo of photos) {
      const key = photoKey('review', input.number, photo.ext);
      // Stored byte-for-byte, like product photography (§4).
      await storage.put({ key, body: photo.bytes, contentType: photo.contentType });
      keys.push(key);
    }
    await prisma.review.create({
      data: {
        orderId: order.id,
        orderLineId: line.id,
        listingId: line.listingId,
        rating: input.rating,
        body: input.body,
        displayName: input.displayName,
        district: order.district,
        photos: keys,
        locale: input.locale,
      },
    });
  } catch (error) {
    // Nothing points at the photos: remove them rather than leave orphans.
    await Promise.all(keys.map((key) => storage.delete(key).catch(() => undefined)));
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return back({ error: 'exists' });
    throw error;
  }
  return back({ done: line.id });
}
