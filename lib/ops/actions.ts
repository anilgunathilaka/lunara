'use server';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { OrderStatus } from '@prisma/client';
import { composeNotifications, isNotifiable } from '@/lib/notifications/compose';
import { deliverSoon } from '@/lib/notifications/deliver';
import { getPrisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { requireStaffAction } from './staff';
import { ORDER_STATUSES, RESTOCK_ON_CANCEL_FROM, canTransition } from './transitions';

/**
 * Operations actions (docs/4-architecture.md §3.5). Each one: re-checks
 * staff access, validates its form, writes atomically, records who did it,
 * then returns to the page with ?saved=1 or ?error=<code>.
 */

type ErrorCode = 'invalid' | 'conflict' | 'negative' | 'tracking';

class OpsError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code);
  }
}

const locale = z.enum(['en', 'si', 'ta']);

function back(path: string, outcome: { error?: ErrorCode }): never {
  revalidatePath(path);
  // Paths are built from validated parts (locale enum, order-number regex).
  redirect((outcome.error ? `${path}?error=${outcome.error}` : `${path}?saved=1`) as Route);
}

async function run(path: string, work: () => Promise<void>): Promise<never> {
  try {
    await work();
  } catch (error) {
    if (error instanceof OpsError) back(path, { error: error.code });
    throw error;
  }
  back(path, {});
}

// ── Orders ───────────────────────────────────────────────────────────────

const transitionSchema = z.object({
  locale,
  number: z.string().regex(/^LUN-[A-Z0-9]{6}$/),
  to: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
  note: z.string().trim().max(500).optional(),
  courier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
});

export async function transitionOrderAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = transitionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) throw new Error('Invalid transition form');
  const { locale: lang, number, to, note, courier, trackingNumber } = parsed.data;
  const path = `/${lang}/ops/orders/${number}`;

  await run(path, async () => {
    if (to === 'dispatched' && (!courier || !trackingNumber)) throw new OpsError('tracking');

    await getPrisma().$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { number }, include: { lines: true } });
      if (!order) throw new OpsError('invalid');
      if (!canTransition(order.status, to)) throw new OpsError('conflict');

      // Only moves if nobody else moved it first.
      const { count } = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: {
          status: to,
          ...(to === 'dispatched' ? { courier, trackingNumber } : {}),
        },
      });
      if (count !== 1) throw new OpsError('conflict');

      if (to === 'cancelled' && RESTOCK_ON_CANCEL_FROM.has(order.status)) {
        const units = new Map<string, number>();
        for (const line of order.lines) {
          for (const sku of [line.sareeSku, line.jacketSku]) {
            if (sku) units.set(sku, (units.get(sku) ?? 0) + line.quantity);
          }
        }
        for (const [sku, quantity] of [...units].sort(([a], [b]) => a.localeCompare(b))) {
          await tx.stockItem.update({ where: { sku }, data: { quantity: { increment: quantity } } });
        }
      }

      await tx.orderEvent.create({
        data: { orderId: order.id, status: to, actor: staff.email, note: note || null },
      });

      // Outbox (§6.1). A cancelled order must not keep sending earlier messages.
      if (to === 'cancelled') {
        await tx.notification.updateMany({
          where: { orderId: order.id, status: { in: ['pending', 'manual'] } },
          data: { status: 'cancelled' },
        });
      }
      if (isNotifiable(to)) {
        const updated = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
        await tx.notification.createMany({ data: composeNotifications(to, updated) });
      }
    });
    deliverSoon();
  });
}

// ── Notifications sent by hand (no WhatsApp/SMS provider yet, §6.1) ──────

const markSentSchema = z.object({ locale, id: z.string().min(1).max(100) });

export async function markNotificationSentAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = markSentSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/messages`;
  if (!parsed.success) back(path, { error: 'invalid' });

  await run(path, async () => {
    const { count } = await getPrisma().notification.updateMany({
      where: { id: parsed.data.id, status: { in: ['manual', 'failed'] } },
      data: { status: 'sent', sentAt: new Date(), sentBy: staff.email },
    });
    if (count !== 1) throw new OpsError('conflict');
  });
}

// ── Stock ────────────────────────────────────────────────────────────────

const adjustSchema = z.object({
  locale,
  sku: z.string().min(1).max(100),
  delta: z.coerce.number().int().min(-10_000).max(10_000).refine((n) => n !== 0),
  reason: z.string().trim().min(2).max(300),
});

export async function adjustStockAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = adjustSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/stock`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { sku, delta, reason } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const before = await tx.stockItem.findUnique({ where: { sku } });
      if (!before) throw new OpsError('invalid');
      // Atomic and relative: never overwrites an order placed meanwhile, never below zero.
      const { count } = await tx.stockItem.updateMany({
        where: { sku, quantity: { gte: Math.max(0, -delta) } },
        data: { quantity: { increment: delta } },
      });
      if (count !== 1) throw new OpsError('negative');
      const after = await tx.stockItem.findUniqueOrThrow({ where: { sku } });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'stock.adjust',
          entityType: 'stock_item',
          entityId: sku,
          before: { quantity: before.quantity },
          after: { quantity: after.quantity, delta },
          note: reason,
        },
      });
    });
  });
}

const thresholdSchema = z.object({
  locale,
  sku: z.string().min(1).max(100),
  threshold: z.coerce.number().int().min(0).max(1000),
});

export async function setThresholdAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = thresholdSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/stock`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { sku, threshold } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const before = await tx.stockItem.findUnique({ where: { sku } });
      if (!before) throw new OpsError('invalid');
      await tx.stockItem.update({ where: { sku }, data: { threshold } });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'stock.threshold',
          entityType: 'stock_item',
          entityId: sku,
          before: { threshold: before.threshold },
          after: { threshold },
        },
      });
    });
  });
}

// ── Prices ───────────────────────────────────────────────────────────────

const price = z.coerce.number().int().min(1).max(1_000_000);

const matrixSchema = z.object({
  locale,
  designId: z.string().min(1).max(100),
  materialId: z.string().min(1).max(100),
  price,
});

export async function updateMatrixPriceAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = matrixSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/prices`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { designId, materialId, price: next } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const where = { designId_materialId: { designId, materialId } };
      const before = await tx.priceMatrix.findUnique({ where });
      if (!before) throw new OpsError('invalid');
      if (before.price === next) return;
      await tx.priceMatrix.update({ where, data: { price: next } });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'price.matrix',
          entityType: 'price_matrix',
          entityId: `${designId}|${materialId}`,
          before: { price: before.price },
          after: { price: next },
        },
      });
    });
  });
}

const jacketPriceSchema = z.object({
  locale,
  id: z.string().min(1).max(100),
  pairingAddOn: z.coerce.number().int().min(0).max(1_000_000),
  standalonePrice: price,
});

export async function updateJacketPricesAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = jacketPriceSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/prices`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { id, pairingAddOn, standalonePrice } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const before = await tx.jacketMaterial.findUnique({ where: { id } });
      if (!before) throw new OpsError('invalid');
      if (before.pairingAddOn === pairingAddOn && before.standalonePrice === standalonePrice) return;
      await tx.jacketMaterial.update({ where: { id }, data: { pairingAddOn, standalonePrice } });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'price.jacket',
          entityType: 'jacket_material',
          entityId: id,
          before: { pairingAddOn: before.pairingAddOn, standalonePrice: before.standalonePrice },
          after: { pairingAddOn, standalonePrice },
        },
      });
    });
  });
}

// ── Photos (§3.7) ─────────────────────────────────────────────────────────
// Uploads go through the /api/ops/media route (raw bytes). Removing and
// ordering gallery photos are plain form posts. The reference frame has no
// remove or replace action: it is write-once (§4).

const galleryPhotoSchema = z.object({
  locale,
  id: z.string().min(1).max(100),
  key: z.string().min(1).max(512),
  op: z.enum(['remove', 'cover']),
});

export async function galleryPhotoAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = galleryPhotoSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/photos`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { id, key, op } = parsed.data;
  const removed: { key?: string } = {};

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const row = await tx.sareeColourway.findUnique({ where: { id }, select: { galleryAssets: true } });
      if (!row || !row.galleryAssets.includes(key)) throw new OpsError('conflict');
      const rest = row.galleryAssets.filter((k) => k !== key);
      const next = op === 'remove' ? rest : [key, ...rest];
      // Compare-and-set on the whole list: a concurrent change makes this a conflict, not a lost edit.
      const { count } = await tx.sareeColourway.updateMany({
        where: { id, galleryAssets: { equals: row.galleryAssets } },
        data: { galleryAssets: next },
      });
      if (count !== 1) throw new OpsError('conflict');
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: op === 'remove' ? 'photo.remove' : 'photo.cover',
          entityType: 'saree_colourway',
          entityId: id,
          before: { galleryAssets: row.galleryAssets },
          after: { galleryAssets: next },
        },
      });
      if (op === 'remove') removed.key = key;
    });
    // After commit: the database no longer points at it. Best effort; an orphan costs only storage.
    if (removed.key) await getStorage().delete(removed.key).catch(() => undefined);
  });
}

// ── Reviews (§3.8, PRD FR-46) ─────────────────────────────────────────────
// Criticism is answered in public, never removed. Hiding needs one of a
// fixed set of reasons, and every change is audited.

const respondSchema = z.object({
  locale,
  id: z.string().min(1).max(100),
  response: z.string().trim().max(2000),
});

export async function respondReviewAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = respondSchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/reviews`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { id, response } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const before = await tx.review.findUnique({ where: { id }, select: { response: true } });
      if (!before) throw new OpsError('invalid');
      await tx.review.update({
        where: { id },
        data: response
          ? { response, respondedBy: staff.email, respondedAt: new Date() }
          : { response: null, respondedBy: null, respondedAt: null },
      });
      await tx.auditLog.create({
        data: { actor: staff.email, action: 'review.respond', entityType: 'review', entityId: id, before: { response: before.response }, after: { response: response || null } },
      });
    });
  });
}

const visibilitySchema = z.object({
  locale,
  id: z.string().min(1).max(100),
  op: z.enum(['hide', 'show']),
  reason: z.enum(['personal_data', 'abusive', 'not_about_product']).optional(),
});

export async function reviewVisibilityAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const parsed = visibilitySchema.safeParse(Object.fromEntries(form));
  const lang = locale.safeParse(form.get('locale')).data ?? 'en';
  const path = `/${lang}/ops/reviews`;
  // Hiding without a reason is refused: a low rating is not a reason.
  if (!parsed.success || (parsed.data.op === 'hide' && !parsed.data.reason)) back(path, { error: 'invalid' });
  const { id, op, reason } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const { count } = await tx.review.updateMany({
        where: { id, status: op === 'hide' ? 'published' : 'hidden' },
        data: op === 'hide' ? { status: 'hidden', hiddenReason: reason, hiddenBy: staff.email } : { status: 'published', hiddenReason: null, hiddenBy: null },
      });
      if (count !== 1) throw new OpsError('conflict');
      await tx.auditLog.create({
        data: { actor: staff.email, action: `review.${op}`, entityType: 'review', entityId: id, after: { reason: reason ?? null } },
      });
    });
  });
}
