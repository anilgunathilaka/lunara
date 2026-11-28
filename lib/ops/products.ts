import 'server-only';
import { activeListing } from '@/lib/catalogue/queries';
import { mediaUrl } from '@/lib/media/photos';
import { getPrisma } from '@/lib/prisma';
import { resolvePairedPrice } from '@/lib/pricing/resolve';
import { availabilityOf } from '@/lib/stock/state';

/**
 * Product management reads (docs/4-architecture.md §3.10): every shop
 * product and jacket colour, archived ones included. Prices are resolved
 * through lib/pricing/resolve, the only place that sums.
 */

export async function productAdminList() {
  const prisma = getPrisma();
  const [listings, jackets, onSale] = await Promise.all([
    prisma.curatedListing.findMany({
      relationLoadStrategy: 'join',
      orderBy: [{ active: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        sareeColourway: { include: { design: true, material: true, price: true, stock: true } },
        jacketColourway: { include: { material: true } },
      },
    }),
    prisma.jacketColourway.findMany({
      relationLoadStrategy: 'join',
      orderBy: [{ active: 'desc' }, { material: { sortOrder: 'asc' } }, { id: 'asc' }],
      include: { material: true, stock: true, _count: { select: { listings: true } } },
    }),
    // The sarees the shop shows, in the shop's order: their positions (founder decision 2026-11-28).
    prisma.curatedListing.findMany({ where: activeListing, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true } }),
  ]);
  const shopPosition = new Map(onSale.map((r, i) => [r.id, i + 1]));
  // On-sale sarees first, in the shop's order; then the rest as before.
  listings.sort((a, b) => (shopPosition.get(a.id) ?? Infinity) - (shopPosition.get(b.id) ?? Infinity));
  return {
    onSaleCount: onSale.length,
    sarees: listings.map((row) => {
      const saree = row.sareeColourway;
      return {
        id: row.id,
        name: row.name,
        code: row.productCode,
        /** 1-based place in the shop, or null when the shop doesn't show it. */
        position: shopPosition.get(row.id) ?? null,
        active: row.active && saree.active,
        featured: row.isFeatured,
        topSeller: row.isTopSeller,
        detail: `${saree.design.name} · ${saree.material.name} · ${saree.colourName}`,
        colourHex: saree.colourHex,
        jacket: `${row.jacketColourway.material.name} · ${row.jacketColourway.colourName}`,
        price: resolvePairedPrice({ sareePrice: row.price, jacketPairingAddOn: row.jacketColourway.material.pairingAddOn }),
        sareePrice: row.price,
        jacketPrice: row.jacketColourway.material.pairingAddOn,
        sku: saree.sku,
        quantity: saree.stock.quantity,
        state: availabilityOf(saree.stock).state,
        cover: saree.galleryAssets[0] ? mediaUrl(saree.galleryAssets[0]) : null,
      };
    }),
    jackets: jackets.map((row) => ({
      id: row.id,
      name: `${row.material.name} · ${row.colourName}`,
      active: row.active,
      colourHex: row.colourHex,
      pairingAddOn: row.material.pairingAddOn,
      photo: row.swatchUrl ? mediaUrl(row.swatchUrl) : null,
      sku: row.sku,
      quantity: row.stock.quantity,
      state: availabilityOf(row.stock).state,
      listings: row._count.listings,
    })),
  };
}

/** Choices for the product forms. */
export async function productFormOptions() {
  const prisma = getPrisma();
  const [designs, materials, jackets, jacketMaterials, prices] = await Promise.all([
    prisma.sareeDesign.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true, name: true, active: true } }),
    // Saree categories on sale (PRD v4.0), in the admin's order.
    prisma.cottonMaterial.findMany({
      where: { active: true, codePrefix: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, codePrefix: true, nextNumber: true },
    }),
    prisma.jacketColourway.findMany({
      where: { active: true },
      orderBy: [{ material: { sortOrder: 'asc' } }, { id: 'asc' }],
      include: { material: { select: { name: true, pairingAddOn: true } } },
    }),
    prisma.jacketMaterial.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
    prisma.priceMatrix.findMany({ select: { designId: true, materialId: true, price: true } }),
  ]);
  // The default jacket (PRD v4.1): the first jacket added, i.e. the oldest one on
  // sale. Fixed: there is no setting to change it; if it is archived, the next
  // oldest takes its place.
  const defaultJacket = jackets.reduce<(typeof jackets)[number] | null>(
    (oldest, j) => (!oldest || j.createdAt < oldest.createdAt ? j : oldest),
    null,
  );
  return {
    designs,
    materials,
    jackets: jackets.map((j) => ({ id: j.id, name: `${j.material.name} · ${j.colourName}`, addOn: j.material.pairingAddOn })),
    defaultJacketId: defaultJacket?.id ?? null,
    jacketMaterials: jacketMaterials.map((m) => ({
      id: m.id,
      name: m.name,
      composition: m.composition,
      pieceLengthMetres: m.pieceLengthMetres.toNumber(),
      pairingAddOn: m.pairingAddOn,
      standalonePrice: m.standalonePrice,
    })),
    /** "design|category" → starting price, filled in when a new saree is added (PRD v4.2). */
    prices: Object.fromEntries(prices.map((p) => [`${p.designId}|${p.materialId}`, p.price])),
  };
}

/** One shop product for editing, with whether it has ever been sold (permanent delete needs not). */
export async function productForEdit(id: string) {
  const prisma = getPrisma();
  const row = await prisma.curatedListing.findUnique({
    relationLoadStrategy: 'join',
    where: { id },
    include: {
      sareeColourway: { include: { design: true, material: true, price: true, stock: { include: { cost: true } } } },
      jacketColourway: { include: { material: { select: { pairingAddOn: true } } } },
    },
  });
  if (!row) return null;
  const sold = await prisma.orderLine.count({
    where: { OR: [{ listingId: row.id }, { sareeColourwayId: row.sareeColourwayId }] },
  });
  return { row, sold };
}

export async function jacketForEdit(id: string) {
  const prisma = getPrisma();
  const row = await prisma.jacketColourway.findUnique({
    relationLoadStrategy: 'join',
    where: { id },
    include: { material: true, stock: { include: { cost: true } }, _count: { select: { listings: true } } },
  });
  if (!row) return null;
  const sold = await prisma.orderLine.count({ where: { jacketColourwayId: row.id } });
  return { row, sold };
}
