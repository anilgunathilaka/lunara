'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { OpsError, back, checkbox, langOf, opsLocale, run, skuCode, slugify, uniqueValue } from './flow';
import { requireStaffAction } from './staff';

/**
 * Product management (docs/4-architecture.md §3.10): add, edit, archive,
 * restore and — only for things never sold — delete shop products and
 * jacket colours. Every write is staff-only, validated, transactional and
 * audited. Price stays single-sourced: a saree's price lives on its
 * design × cotton in PRICE_MATRIX, shared by every colour of that design
 * in that cotton (CLAUDE.md).
 */

const NEW = '__new';
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const money = z.coerce.number().int().min(1).max(1_000_000);
const count = z.coerce.number().int().min(0).max(100_000);
const text = (min: number, max: number) => z.string().trim().min(min).max(max);

function lot(): string {
  const now = new Date();
  return `LOT-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

type Tx = Prisma.TransactionClient;

async function audit(tx: Tx, actor: string, action: string, entityType: string, entityId: string, after: Prisma.InputJsonValue, before?: Prisma.InputJsonValue) {
  await tx.auditLog.create({ data: { actor, action, entityType, entityId, before, after } });
}

/** Sets a design × cotton price, audited when it changes. It applies to every colour of that design in that cotton. */
async function setMatrixPrice(tx: Tx, actor: string, designId: string, materialId: string, price: number) {
  const current = await tx.priceMatrix.findUnique({ where: { designId_materialId: { designId, materialId } } });
  if (current?.price === price) return;
  await tx.priceMatrix.upsert({
    where: { designId_materialId: { designId, materialId } },
    create: { designId, materialId, price },
    update: { price },
  });
  await audit(tx, actor, 'price.matrix', 'price_matrix', `${designId}|${materialId}`, { price }, current ? { price: current.price } : undefined);
}

// ── Sarees (shop products) ────────────────────────────────────────────────

const createSchema = z.object({
  locale: opsLocale,
  name: text(2, 80),
  designId: z.string().min(1).max(100),
  newDesignName: z.string().trim().max(60).optional(),
  materialId: z.enum(['plain', 'super']),
  colourName: text(1, 40),
  colourHex: hex,
  price: money,
  jacketColourwayId: z.string().min(1).max(100),
  quantity: count,
  threshold: count,
  featured: checkbox,
});

export async function createProductAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products/new`;
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;
  if (input.designId === NEW && (!input.newDesignName || input.newDesignName.length < 2)) back(path, { error: 'invalid' });

  await run(path, async () => {
    const prisma = getPrisma();
    const id = await prisma.$transaction(async (tx) => {
      // Design: an existing one, or a new one created here.
      let designId = input.designId;
      let designName: string;
      if (designId === NEW) {
        designName = input.newDesignName!;
        designId = await uniqueValue(slugify(designName), async (v) => !!(await tx.sareeDesign.findUnique({ where: { id: v } })));
        const last = await tx.sareeDesign.aggregate({ _max: { sortOrder: true } });
        await tx.sareeDesign.create({ data: { id: designId, name: designName, sortOrder: (last._max.sortOrder ?? 0) + 1 } });
        await audit(tx, staff.email, 'design.create', 'saree_design', designId, { name: designName });
      } else {
        const design = await tx.sareeDesign.findUnique({ where: { id: designId } });
        if (!design) throw new OpsError('invalid');
        designName = design.name;
      }
      const jacket = await tx.jacketColourway.findUnique({ where: { id: input.jacketColourwayId } });
      if (!jacket || !jacket.active) throw new OpsError('invalid');

      const duplicate = await tx.sareeColourway.findUnique({
        where: { designId_materialId_colourName: { designId, materialId: input.materialId, colourName: input.colourName } },
      });
      if (duplicate) throw new OpsError('exists');

      await setMatrixPrice(tx, staff.email, designId, input.materialId, input.price);

      const colourwayId = await uniqueValue(slugify(`${designId}-${input.materialId}-${input.colourName}`, 80), async (v) => !!(await tx.sareeColourway.findUnique({ where: { id: v } })));
      const sku = await uniqueValue(
        `SAR-${skuCode(designName)}-${input.materialId === 'plain' ? 'PLN' : 'SUP'}-${skuCode(input.colourName)}`,
        async (v) => !!(await tx.stockItem.findUnique({ where: { sku: v } })),
      );
      await tx.stockItem.create({ data: { sku, quantity: input.quantity, threshold: input.threshold } });
      await tx.sareeColourway.create({
        data: { id: colourwayId, designId, materialId: input.materialId, colourName: input.colourName, colourHex: input.colourHex, lotId: lot(), sku },
      });

      const listingId = await uniqueValue(slugify(input.name), async (v) => !!(await tx.curatedListing.findUnique({ where: { id: v } })));
      const last = await tx.curatedListing.aggregate({ _max: { sortOrder: true } });
      await tx.curatedListing.create({
        data: {
          id: listingId,
          name: input.name,
          sareeColourwayId: colourwayId,
          jacketColourwayId: jacket.id,
          isFeatured: input.featured,
          sortOrder: (last._max.sortOrder ?? 0) + 1,
        },
      });
      await audit(tx, staff.email, 'product.create', 'curated_listing', listingId, {
        name: input.name,
        designId,
        materialId: input.materialId,
        colourName: input.colourName,
        sku,
        quantity: input.quantity,
        jacketColourwayId: jacket.id,
      });
      return listingId;
    });
    return `/${lang}/ops/products/${id}`;
  });
}

const updateSchema = z.object({
  locale: opsLocale,
  id: z.string().min(1).max(100),
  name: text(2, 80),
  colourName: text(1, 40),
  colourHex: hex,
  price: money,
  jacketColourwayId: z.string().min(1).max(100),
  threshold: count,
  featured: checkbox,
});

export async function updateProductAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const id = String(form.get('id') ?? '');
  const path = `/${lang}/ops/products/${encodeURIComponent(id)}`;
  const parsed = updateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const listing = await tx.curatedListing.findUnique({ where: { id: input.id }, include: { sareeColourway: { include: { stock: true } } } });
      if (!listing) throw new OpsError('notFound');
      const saree = listing.sareeColourway;
      const jacket = await tx.jacketColourway.findUnique({ where: { id: input.jacketColourwayId } });
      if (!jacket || (!jacket.active && jacket.id !== listing.jacketColourwayId)) throw new OpsError('invalid');

      if (input.colourName !== saree.colourName) {
        const clash = await tx.sareeColourway.findUnique({
          where: { designId_materialId_colourName: { designId: saree.designId, materialId: saree.materialId, colourName: input.colourName } },
        });
        if (clash) throw new OpsError('exists');
      }
      await tx.sareeColourway.update({ where: { id: saree.id }, data: { colourName: input.colourName, colourHex: input.colourHex } });
      await tx.stockItem.update({ where: { sku: saree.sku }, data: { threshold: input.threshold } });
      await setMatrixPrice(tx, staff.email, saree.designId, saree.materialId, input.price);
      await tx.curatedListing.update({
        where: { id: listing.id },
        data: { name: input.name, isFeatured: input.featured, jacketColourwayId: jacket.id },
      });
      await audit(
        tx,
        staff.email,
        'product.update',
        'curated_listing',
        listing.id,
        { name: input.name, colourName: input.colourName, colourHex: input.colourHex, jacketColourwayId: jacket.id, featured: input.featured, threshold: input.threshold },
        { name: listing.name, colourName: saree.colourName, colourHex: saree.colourHex, jacketColourwayId: listing.jacketColourwayId, featured: listing.isFeatured, threshold: saree.stock.threshold },
      );
    });
  });
}

const idSchema = z.object({ locale: opsLocale, id: z.string().min(1).max(100), op: z.enum(['archive', 'restore', 'delete']) });

export async function productStatusAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const parsed = idSchema.safeParse(Object.fromEntries(form));
  const id = String(form.get('id') ?? '');
  const path = `/${lang}/ops/products/${encodeURIComponent(id)}`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { op } = parsed.data;
  // Permanent delete needs the explicit "can't be undone" tick, checked here as well as in the form.
  if (op === 'delete' && form.get('confirm') !== 'on') back(path, { error: 'invalid' });

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const listing = await tx.curatedListing.findUnique({ where: { id } });
      if (!listing) throw new OpsError('notFound');
      const otherActive = await tx.curatedListing.count({ where: { sareeColourwayId: listing.sareeColourwayId, active: true, NOT: { id } } });

      if (op === 'archive' || op === 'restore') {
        const active = op === 'restore';
        await tx.curatedListing.update({ where: { id }, data: { active } });
        // The saree colour follows its product, unless another live product still uses it.
        if (active || otherActive === 0) await tx.sareeColourway.update({ where: { id: listing.sareeColourwayId }, data: { active } });
        await audit(tx, staff.email, `product.${op}`, 'curated_listing', id, { active });
        return;
      }

      // Permanent delete: only what has never been sold, and nothing a review points at.
      const sold = await tx.orderLine.count({ where: { OR: [{ listingId: id }, { sareeColourwayId: listing.sareeColourwayId }] } });
      if (sold > 0) throw new OpsError('sold');
      await tx.curatedListing.delete({ where: { id } });
      const usedElsewhere = await tx.curatedListing.count({ where: { sareeColourwayId: listing.sareeColourwayId } });
      if (usedElsewhere === 0) {
        const colourway = await tx.sareeColourway.delete({ where: { id: listing.sareeColourwayId } });
        await tx.stockItem.delete({ where: { sku: colourway.sku } });
      }
      await audit(tx, staff.email, 'product.delete', 'curated_listing', id, { deleted: true }, { name: listing.name, sareeColourwayId: listing.sareeColourwayId });
    });
    return op === 'delete' ? `/${lang}/ops/products` : undefined;
  });
}

// ── Jacket colours ────────────────────────────────────────────────────────

const jacketCreateSchema = z.object({
  locale: opsLocale,
  materialId: z.string().min(1).max(100),
  newMaterialName: z.string().trim().max(60).optional(),
  composition: z.string().trim().max(120).optional(),
  pieceLengthMetres: z.coerce.number().min(0.3).max(5).optional(),
  pairingAddOn: z.coerce.number().int().min(0).max(1_000_000).optional(),
  standalonePrice: money.optional(),
  colourName: text(1, 40),
  colourHex: hex,
  quantity: count,
  threshold: count,
});

export async function createJacketAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products/jackets/new`;
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => v !== ''));
  const parsed = jacketCreateSchema.safeParse(raw);
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;
  const isNew = input.materialId === NEW;
  if (isNew && (!input.newMaterialName || input.newMaterialName.length < 2 || !input.composition || !input.pieceLengthMetres || input.standalonePrice === undefined)) {
    back(path, { error: 'invalid' });
  }

  await run(path, async () => {
    const id = await getPrisma().$transaction(async (tx) => {
      let materialId = input.materialId;
      let materialName: string;
      if (isNew) {
        materialName = input.newMaterialName!;
        materialId = await uniqueValue(slugify(materialName), async (v) => !!(await tx.jacketMaterial.findUnique({ where: { id: v } })));
        const last = await tx.jacketMaterial.aggregate({ _max: { sortOrder: true } });
        await tx.jacketMaterial.create({
          data: {
            id: materialId,
            name: materialName,
            composition: input.composition!,
            pieceLengthMetres: new Prisma.Decimal(input.pieceLengthMetres!),
            pairingAddOn: input.pairingAddOn ?? 0,
            standalonePrice: input.standalonePrice!,
            sortOrder: (last._max.sortOrder ?? 0) + 1,
          },
        });
        await audit(tx, staff.email, 'jacket_material.create', 'jacket_material', materialId, { name: materialName, standalonePrice: input.standalonePrice!, pairingAddOn: input.pairingAddOn ?? 0 });
      } else {
        const material = await tx.jacketMaterial.findUnique({ where: { id: materialId } });
        if (!material) throw new OpsError('invalid');
        materialName = material.name;
      }
      const duplicate = await tx.jacketColourway.findUnique({ where: { materialId_colourName: { materialId, colourName: input.colourName } } });
      if (duplicate) throw new OpsError('exists');

      const colourwayId = await uniqueValue(slugify(`${materialName}-${input.colourName}`, 80), async (v) => !!(await tx.jacketColourway.findUnique({ where: { id: v } })));
      const sku = await uniqueValue(`JKT-${skuCode(materialName)}-${skuCode(input.colourName)}`, async (v) => !!(await tx.stockItem.findUnique({ where: { sku: v } })));
      await tx.stockItem.create({ data: { sku, quantity: input.quantity, threshold: input.threshold } });
      await tx.jacketColourway.create({
        data: { id: colourwayId, materialId, colourName: input.colourName, colourHex: input.colourHex, lotId: lot(), sku },
      });
      await audit(tx, staff.email, 'jacket.create', 'jacket_colourway', colourwayId, { materialId, colourName: input.colourName, sku, quantity: input.quantity });
      return colourwayId;
    });
    return `/${lang}/ops/products/jackets/${id}`;
  });
}

const jacketUpdateSchema = z.object({
  locale: opsLocale,
  id: z.string().min(1).max(100),
  colourName: text(1, 40),
  colourHex: hex,
  pairingAddOn: z.coerce.number().int().min(0).max(1_000_000),
  standalonePrice: money,
  threshold: count,
});

export async function updateJacketAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const id = String(form.get('id') ?? '');
  const path = `/${lang}/ops/products/jackets/${encodeURIComponent(id)}`;
  const parsed = jacketUpdateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const jacket = await tx.jacketColourway.findUnique({ where: { id: input.id }, include: { material: true, stock: true } });
      if (!jacket) throw new OpsError('notFound');
      if (input.colourName !== jacket.colourName) {
        const clash = await tx.jacketColourway.findUnique({ where: { materialId_colourName: { materialId: jacket.materialId, colourName: input.colourName } } });
        if (clash) throw new OpsError('exists');
      }
      await tx.jacketColourway.update({ where: { id: jacket.id }, data: { colourName: input.colourName, colourHex: input.colourHex } });
      await tx.stockItem.update({ where: { sku: jacket.sku }, data: { threshold: input.threshold } });
      // Material prices are shared by every colour of this jacket material.
      if (jacket.material.pairingAddOn !== input.pairingAddOn || jacket.material.standalonePrice !== input.standalonePrice) {
        await tx.jacketMaterial.update({ where: { id: jacket.materialId }, data: { pairingAddOn: input.pairingAddOn, standalonePrice: input.standalonePrice } });
        await audit(tx, staff.email, 'price.jacket', 'jacket_material', jacket.materialId, { pairingAddOn: input.pairingAddOn, standalonePrice: input.standalonePrice }, { pairingAddOn: jacket.material.pairingAddOn, standalonePrice: jacket.material.standalonePrice });
      }
      await audit(tx, staff.email, 'jacket.update', 'jacket_colourway', jacket.id, { colourName: input.colourName, colourHex: input.colourHex, threshold: input.threshold }, { colourName: jacket.colourName, colourHex: jacket.colourHex, threshold: jacket.stock.threshold });
    });
  });
}

export async function jacketStatusAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const parsed = idSchema.safeParse(Object.fromEntries(form));
  const id = String(form.get('id') ?? '');
  const path = `/${lang}/ops/products/jackets/${encodeURIComponent(id)}`;
  if (!parsed.success) back(path, { error: 'invalid' });
  const { op } = parsed.data;
  // Permanent delete needs the explicit "can't be undone" tick, checked here as well as in the form.
  if (op === 'delete' && form.get('confirm') !== 'on') back(path, { error: 'invalid' });

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const jacket = await tx.jacketColourway.findUnique({ where: { id } });
      if (!jacket) throw new OpsError('notFound');
      if (op === 'archive' || op === 'restore') {
        // A jacket paired in a live saree product can't be archived: archive or re-pair that product first.
        if (op === 'archive' && (await tx.curatedListing.count({ where: { jacketColourwayId: id, active: true } })) > 0) throw new OpsError('inUse');
        await tx.jacketColourway.update({ where: { id }, data: { active: op === 'restore' } });
        await audit(tx, staff.email, `jacket.${op}`, 'jacket_colourway', id, { active: op === 'restore' });
        return;
      }
      if ((await tx.orderLine.count({ where: { jacketColourwayId: id } })) > 0) throw new OpsError('sold');
      if ((await tx.curatedListing.count({ where: { jacketColourwayId: id } })) > 0) throw new OpsError('inUse');
      await tx.jacketColourway.delete({ where: { id } });
      await tx.stockItem.delete({ where: { sku: jacket.sku } });
      await audit(tx, staff.email, 'jacket.delete', 'jacket_colourway', id, { deleted: true }, { colourName: jacket.colourName, sku: jacket.sku });
    });
    return op === 'delete' ? `/${lang}/ops/products` : undefined;
  });
}
