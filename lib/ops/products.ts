import 'server-only';
import { mediaUrl } from '@/lib/media/photos';
import { getPrisma } from '@/lib/prisma';
import { resolvePairedPrice, resolveStandaloneJacketPrice } from '@/lib/pricing/resolve';
import { availabilityOf } from '@/lib/stock/state';

/**
 * Product management reads (docs/4-architecture.md §3.10): every shop
 * product and jacket colour, archived ones included. Prices are resolved
 * through lib/pricing/resolve, the only place that sums.
 */

export async function productAdminList() {
  const prisma = getPrisma();
  const [listings, jackets] = await Promise.all([
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
  ]);
  return {
    sarees: listings.map((row) => {
      const saree = row.sareeColourway;
      return {
        id: row.id,
        name: row.name,
        active: row.active && saree.active,
        featured: row.isFeatured,
        detail: `${saree.design.name} · ${saree.material.name} · ${saree.colourName}`,
        colourHex: saree.colourHex,
        jacket: `${row.jacketColourway.material.name} · ${row.jacketColourway.colourName}`,
        price: resolvePairedPrice({ matrixPrice: saree.price.price, jacketPairingAddOn: row.jacketColourway.material.pairingAddOn }),
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
      price: resolveStandaloneJacketPrice({ standalonePrice: row.material.standalonePrice }),
      pairingAddOn: row.material.pairingAddOn,
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
    prisma.cottonMaterial.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true } }),
    prisma.jacketColourway.findMany({
      where: { active: true },
      orderBy: [{ material: { sortOrder: 'asc' } }, { id: 'asc' }],
      include: { material: { select: { name: true } } },
    }),
    prisma.jacketMaterial.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
    prisma.priceMatrix.findMany({ select: { designId: true, materialId: true, price: true } }),
  ]);
  return {
    designs,
    materials,
    jackets: jackets.map((j) => ({ id: j.id, name: `${j.material.name} · ${j.colourName}` })),
    jacketMaterials: jacketMaterials.map((m) => ({
      id: m.id,
      name: m.name,
      composition: m.composition,
      pieceLengthMetres: m.pieceLengthMetres.toNumber(),
      pairingAddOn: m.pairingAddOn,
      standalonePrice: m.standalonePrice,
    })),
    /** "design|material" → saree price, shown so staff see what a design already costs. */
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
