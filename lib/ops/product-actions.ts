'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { OpsError, back, checkbox, langOf, opsLocale, run, skuCode, slugify, uniqueValue } from './flow';
import { recordCreated } from '@/lib/stock/movements';
import { formatProductCode } from '@/lib/catalogue/product-code';
import { activeListing } from '@/lib/catalogue/queries';
import { MAX_PHOTO_BYTES, photoKey, sniffPhoto } from '@/lib/media/photos';
import { getStorage } from '@/lib/storage';
import { requireStaffAction } from './staff';

/**
 * Product management (docs/4-architecture.md §3.10): add, edit, archive,
 * restore and — only for things never sold — delete shop products and
 * jacket colours. Every write is staff-only, validated, transactional and
 * audited. Price stays single-sourced: a saree's price lives on its
 * design × saree category in PRICE_MATRIX, shared by every colour of that
 * design in that category (CLAUDE.md; PRD v4.0). Each new product gets its
 * unique code (LSC001 …) from its category, in the same transaction.
 */

const NEW = '__new';
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const money = z.coerce.number().int().min(1).max(1_000_000);
const count = z.coerce.number().int().min(0).max(100_000);
/** Optional per-saree material details (founder decision 2026-11-24): empty → null → the category's value. */
/** Grams, saree and jacket material together: a kitchen scale's reading. */
const optionalGrams = z.union([z.literal('').transform(() => null), z.coerce.number().int().min(50).max(5000)]);
const optionalLength = z.union([z.literal('').transform(() => null), z.coerce.number().min(1).max(15).multipleOf(0.01)]);
const optionalOpacity = z.union([z.literal('').transform(() => null), z.enum(['opaque', 'semi_sheer', 'sheer'])]);
const materialDetails = { weightGrams: optionalGrams.default(null), lengthMetres: optionalLength.default(null), opacity: optionalOpacity.default(null) };
const text = (min: number, max: number) => z.string().trim().min(min).max(max);

function lot(): string {
  const now = new Date();
  return `LOT-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

type Tx = Prisma.TransactionClient;

async function audit(tx: Tx, actor: string, action: string, entityType: string, entityId: string, after: Prisma.InputJsonValue, before?: Prisma.InputJsonValue) {
  await tx.auditLog.create({ data: { actor, action, entityType, entityId, before, after } });
}

/**
 * Makes sure a design × category price exists (every saree colour needs one,
 * and Design Your Own prices from it). PRD v4.2: a saree's own price lives on
 * the saree, so an existing matrix price is never overwritten from here.
 */
async function ensureMatrixPrice(tx: Tx, actor: string, designId: string, materialId: string, price: number) {
  const current = await tx.priceMatrix.findUnique({ where: { designId_materialId: { designId, materialId } } });
  if (current) return;
  await tx.priceMatrix.create({ data: { designId, materialId, price } });
  await audit(tx, actor, 'price.matrix', 'price_matrix', `${designId}|${materialId}`, { price });
}

// ── Sarees (shop products) ────────────────────────────────────────────────

/**
 * The next unique product code in a category: its prefix and running number,
 * three digits at least (LSC001 … LSC999, then LSC1000). The number is taken
 * by an atomic increment; a code already in use (entered by hand, say) is
 * skipped. Codes are never reused or changed (PRD v4.0).
 */
async function nextProductCode(tx: Tx, categoryId: string): Promise<string> {
  for (;;) {
    const category = await tx.cottonMaterial.update({ where: { id: categoryId }, data: { nextNumber: { increment: 1 } } });
    const code = formatProductCode(category.codePrefix!, category.nextNumber - 1);
    if (!(await tx.curatedListing.findUnique({ where: { productCode: code } }))) return code;
  }
}

const createSchema = z.object({
  locale: opsLocale,
  name: text(2, 80),
  designId: z.string().min(1).max(100),
  newDesignName: z.string().trim().max(60).optional(),
  /** The saree category (PRD v4.0); the column keeps its old name. */
  materialId: z.string().min(1).max(100),
  colourName: text(1, 40),
  colourHex: hex,
  price: money,
  jacketColourwayId: z.string().min(1).max(100),
  quantity: count,
  threshold: count,
  featured: checkbox,
  topSeller: checkbox,
  ...materialDetails,
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
      // The category: on sale, with a code prefix. Taking its next number here,
      // inside the transaction, means two products added at once never share a code.
      const category = await tx.cottonMaterial.findUnique({ where: { id: input.materialId } });
      if (!category || !category.active || !category.codePrefix) throw new OpsError('invalid');
      const productCode = await nextProductCode(tx, category.id);

      const duplicate = await tx.sareeColourway.findUnique({
        where: { designId_materialId_colourName: { designId, materialId: input.materialId, colourName: input.colourName } },
      });
      if (duplicate) throw new OpsError('exists');

      await ensureMatrixPrice(tx, staff.email, designId, input.materialId, input.price);

      const colourwayId = await uniqueValue(slugify(`${designId}-${input.materialId}-${input.colourName}`, 80), async (v) => !!(await tx.sareeColourway.findUnique({ where: { id: v } })));
      const sku = await uniqueValue(
        `SAR-${skuCode(designName)}-${category.codePrefix}-${skuCode(input.colourName)}`,
        async (v) => !!(await tx.stockItem.findUnique({ where: { sku: v } })),
      );
      await tx.stockItem.create({ data: { sku, quantity: input.quantity, threshold: input.threshold } });
      await recordCreated(tx, sku, input.quantity, staff.email);
      await tx.sareeColourway.create({
        data: { id: colourwayId, designId, materialId: input.materialId, colourName: input.colourName, colourHex: input.colourHex, lotId: lot(), sku },
      });

      const listingId = await uniqueValue(slugify(input.name), async (v) => !!(await tx.curatedListing.findUnique({ where: { id: v } })));
      // New sarees open the shop (founder decision 2026-11-28): one place before
      // the current first. The admin moves it from there on the Products list.
      const first = await tx.curatedListing.aggregate({ _min: { sortOrder: true } });
      await tx.curatedListing.create({
        data: {
          id: listingId,
          name: input.name,
          productCode,
          sareeColourwayId: colourwayId,
          jacketColourwayId: jacket.id,
          // This saree's own price (PRD v4.2).
          price: input.price,
          isFeatured: input.featured,
          isTopSeller: input.topSeller,
          weightGrams: input.weightGrams,
          lengthMetres: input.lengthMetres,
          opacity: input.opacity,
          sortOrder: (first._min.sortOrder ?? 1) - 1,
        },
      });
      await audit(tx, staff.email, 'product.create', 'curated_listing', listingId, {
        name: input.name,
        productCode,
        designId,
        materialId: input.materialId,
        colourName: input.colourName,
        sku,
        quantity: input.quantity,
        jacketColourwayId: jacket.id,
        price: input.price,
        topSeller: input.topSeller,
        weightGrams: input.weightGrams,
        lengthMetres: input.lengthMetres,
        opacity: input.opacity,
      });
      return listingId;
    });
    return `/${lang}/ops/products/${id}`;
  }, 'sareeAdded');
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
  topSeller: checkbox,
  ...materialDetails,
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
      // PRD v4.2: this saree's price alone; other sarees keep theirs.
      if (listing.price !== input.price) {
        await audit(tx, staff.email, 'price.saree', 'curated_listing', listing.id, { price: input.price }, { price: listing.price });
      }
      await tx.curatedListing.update({
        where: { id: listing.id },
        data: {
          name: input.name,
          isFeatured: input.featured,
          isTopSeller: input.topSeller,
          jacketColourwayId: jacket.id,
          price: input.price,
          weightGrams: input.weightGrams,
          lengthMetres: input.lengthMetres,
          opacity: input.opacity,
        },
      });
      await audit(
        tx,
        staff.email,
        'product.update',
        'curated_listing',
        listing.id,
        { name: input.name, colourName: input.colourName, colourHex: input.colourHex, jacketColourwayId: jacket.id, featured: input.featured, topSeller: input.topSeller, threshold: input.threshold, weightGrams: input.weightGrams, lengthMetres: input.lengthMetres, opacity: input.opacity },
        { name: listing.name, colourName: saree.colourName, colourHex: saree.colourHex, jacketColourwayId: listing.jacketColourwayId, featured: listing.isFeatured, topSeller: listing.isTopSeller, threshold: saree.stock.threshold, weightGrams: listing.weightGrams, lengthMetres: listing.lengthMetres?.toNumber() ?? null, opacity: listing.opacity },
      );
    });
  }, 'sareeUpdated');
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
  }, ({ archive: 'sareeArchived', restore: 'sareeRestored', delete: 'sareeDeleted' } as const)[op]);
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
  /** Worked out in the browser from the photograph (JacketPhotoField). */
  colourHex: hex,
  quantity: count,
  threshold: count,
});

export async function createJacketAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products/jackets/new`;
  const raw = Object.fromEntries([...form.entries()].filter(([k, v]) => v !== '' && k !== 'swatch'));
  const parsed = jacketCreateSchema.safeParse(raw);
  // The jacket's photograph (founder decision 2026-11-14): required, a real image, within the size limit.
  const file = form.get('swatch');
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_PHOTO_BYTES) back(path, { error: 'invalid' });
  const photo = new Uint8Array(await file.arrayBuffer());
  const format = sniffPhoto(photo);
  if (!format) back(path, { error: 'invalid' });
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;
  const isNew = input.materialId === NEW;
  if (isNew && (!input.newMaterialName || input.newMaterialName.length < 2 || !input.composition || !input.pieceLengthMetres)) {
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
            // Not asked for while jacket material is not sold on its own (PRD v4.1).
            standalonePrice: input.standalonePrice ?? Math.max(1, input.pairingAddOn ?? 0),
            sortOrder: (last._max.sortOrder ?? 0) + 1,
          },
        });
        await audit(tx, staff.email, 'jacket_material.create', 'jacket_material', materialId, { name: materialName, standalonePrice: input.standalonePrice ?? Math.max(1, input.pairingAddOn ?? 0), pairingAddOn: input.pairingAddOn ?? 0 });
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
      await recordCreated(tx, sku, input.quantity, staff.email);
      await tx.jacketColourway.create({
        data: { id: colourwayId, materialId, colourName: input.colourName, colourHex: input.colourHex, lotId: lot(), sku },
      });
      await audit(tx, staff.email, 'jacket.create', 'jacket_colourway', colourwayId, { materialId, colourName: input.colourName, sku, quantity: input.quantity });
      return colourwayId;
    });
    // The photograph, stored byte-for-byte (§4) once the jacket exists. If
    // storing fails, the jacket is kept and the photo can be added on the Photos page.
    const storage = getStorage();
    const key = photoKey('swatch', id, format.ext);
    try {
      await storage.put({ key, body: photo, contentType: format.contentType });
      await getPrisma().$transaction(async (tx) => {
        await tx.jacketColourway.update({ where: { id }, data: { swatchUrl: key } });
        await audit(tx, staff.email, 'photo.swatch', 'jacket_colourway', id, { key, bytes: photo.length, contentType: format.contentType });
      });
    } catch {
      await storage.delete(key).catch(() => undefined);
      // Saved without its photo: the Photos page is where it can be added.
      return `/${lang}/ops/photos`;
    }
    return `/${lang}/ops/products/jackets/${id}`;
  }, 'jacketAdded');
}

const jacketUpdateSchema = z.object({
  locale: opsLocale,
  id: z.string().min(1).max(100),
  colourName: text(1, 40),
  colourHex: hex,
  pairingAddOn: z.coerce.number().int().min(0).max(1_000_000),
  /** Not asked for while jacket material is not sold on its own (PRD v4.1): follows the jacket price. */
  standalonePrice: money.optional(),
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
      // One jacket price (docs/2-ui.md §7.7): the stored stand-alone price follows it.
      const standalonePrice = input.standalonePrice ?? Math.max(1, input.pairingAddOn);
      if (jacket.material.pairingAddOn !== input.pairingAddOn || jacket.material.standalonePrice !== standalonePrice) {
        await tx.jacketMaterial.update({ where: { id: jacket.materialId }, data: { pairingAddOn: input.pairingAddOn, standalonePrice } });
        await audit(tx, staff.email, 'price.jacket', 'jacket_material', jacket.materialId, { pairingAddOn: input.pairingAddOn, standalonePrice }, { pairingAddOn: jacket.material.pairingAddOn, standalonePrice: jacket.material.standalonePrice });
      }
      await audit(tx, staff.email, 'jacket.update', 'jacket_colourway', jacket.id, { colourName: input.colourName, colourHex: input.colourHex, threshold: input.threshold }, { colourName: jacket.colourName, colourHex: jacket.colourHex, threshold: jacket.stock.threshold });
    });
  }, 'jacketUpdated');
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
  }, ({ archive: 'jacketArchived', restore: 'jacketRestored', delete: 'jacketDeleted' } as const)[op]);
}

// ── Shop order ────────────────────────────────────────────────────────────

const moveSchema = z.object({ id: z.string().min(1).max(100), direction: z.enum(['up', 'down']) });

/**
 * Moves a saree one place up or down in the shop (founder decision
 * 2026-11-28). The shop's "Featured" order is curated_listing.sortOrder;
 * the sarees on sale (the shop's own activeListing rule) are renumbered
 * 1…n in their new order, so ties and gaps from older data disappear.
 * Archived sarees keep their numbers and are not part of the order.
 */
export async function moveProductAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products`;
  const parsed = moveSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const { id, direction } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      // One reorder at a time: two admins moving sarees at once can't interleave.
      await tx.$queryRaw`select id from curated_listing where active for update`;
      const rows = await tx.curatedListing.findMany({ where: activeListing, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true, sortOrder: true } });
      const from = rows.findIndex((r) => r.id === id);
      if (from < 0) throw new OpsError('notFound');
      const to = direction === 'up' ? from - 1 : from + 1;
      if (to < 0 || to >= rows.length) return; // Already first or last.
      const order = rows.map((r) => r.id);
      [order[from], order[to]] = [order[to]!, order[from]!];
      for (const [i, rowId] of order.entries()) {
        const before = rows.find((r) => r.id === rowId)!.sortOrder;
        if (before !== i + 1) await tx.curatedListing.update({ where: { id: rowId }, data: { sortOrder: i + 1 } });
      }
      await tx.auditLog.create({
        data: { actor: staff.email, action: 'product.move', entityType: 'curated_listing', entityId: id, before: { position: from + 1 }, after: { position: to + 1 } },
      });
    });
  }, 'productMoved');
}
