import 'server-only';
import { connection } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { resolvePairedPrice, resolveStandaloneJacketPrice } from '@/lib/pricing/resolve';
import { availabilityOf, combinedAvailability } from '@/lib/stock/state';
import {
  PLACEHOLDER_IMAGE,
  deltaKey,
  quoteKey,
  type CatalogueProduct,
  type ConfiguratorCatalogue,
  type JacketProduct,
  type JacketProductDetail,
  type MaterialId,
  type Opacity,
} from './types';

/**
 * Catalogue reads (docs/4-architecture.md §3.3). Every function:
 * - calls connection(), so pages using it render per request and price and
 *   stock are never baked into a build;
 * - loads its data in ONE SQL query (relationLoadStrategy: 'join');
 * - resolves price through lib/pricing/resolve and stock through
 *   lib/stock/state, the single sources for both.
 */

export const listingInclude = {
  sareeColourway: { include: { design: true, material: true, price: true, stock: true } },
  jacketColourway: { include: { material: true, stock: true } },
} satisfies Prisma.CuratedListingInclude;

type ListingRow = Prisma.CuratedListingGetPayload<{ include: typeof listingInclude }>;

export const activeListing = {
  active: true,
  sareeColourway: { design: { active: true }, material: { active: true } },
  jacketColourway: { material: { active: true } },
} satisfies Prisma.CuratedListingWhereInput;

const OPACITY: Record<string, Opacity> = { opaque: 'opaque', semi_sheer: 'semi-sheer', sheer: 'sheer' };

function toMaterialId(id: string): MaterialId {
  return id === 'super' ? 'super' : 'plain';
}

function toProduct(row: ListingRow): CatalogueProduct {
  const saree = row.sareeColourway;
  const jacket = row.jacketColourway;
  const availability = combinedAvailability(availabilityOf(saree.stock), availabilityOf(jacket.stock));
  return {
    id: row.id,
    name: row.name,
    material: toMaterialId(saree.materialId),
    price: resolvePairedPrice({ matrixPrice: saree.price.price, jacketPairingAddOn: jacket.material.pairingAddOn }),
    colourName: saree.colourName,
    colourHex: saree.colourHex,
    occasions: saree.design.occasionTags,
    opacity: OPACITY[saree.material.opacity] ?? 'opaque',
    gsm: saree.material.gsm,
    lengthMetres: saree.material.lengthMetres.toNumber(),
    jacketMaterialName: jacket.material.name,
    jacketColourName: jacket.colourName,
    jacketSwatchHex: jacket.colourHex,
    jacketPieceLengthMetres: jacket.material.pieceLengthMetres.toNumber(),
    stockState: availability.state,
    quantity: availability.quantity,
  };
}

export async function getCuratedListings(options: { featuredOnly?: boolean; limit?: number } = {}): Promise<
  CatalogueProduct[]
> {
  await connection();
  const rows = await getPrisma().curatedListing.findMany({
    relationLoadStrategy: 'join',
    where: { ...activeListing, ...(options.featuredOnly ? { isFeatured: true } : {}) },
    include: listingInclude,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    take: options.limit,
  });
  return rows.map(toProduct);
}

export async function getCuratedListing(id: string): Promise<CatalogueProduct | null> {
  await connection();
  const row = await getPrisma().curatedListing.findFirst({
    relationLoadStrategy: 'join',
    where: { ...activeListing, id },
    include: listingInclude,
  });
  return row ? toProduct(row) : null;
}

export const jacketInclude = {
  material: true,
  stock: true,
} satisfies Prisma.JacketColourwayInclude;

type JacketRow = Prisma.JacketColourwayGetPayload<{ include: typeof jacketInclude }>;

function toJacket(row: JacketRow): JacketProduct {
  const availability = availabilityOf(row.stock);
  return {
    id: row.id,
    materialName: row.material.name,
    colourName: row.colourName,
    swatchHex: row.colourHex,
    composition: row.material.composition,
    pieceLengthMetres: row.material.pieceLengthMetres.toNumber(),
    price: resolveStandaloneJacketPrice({ standalonePrice: row.material.standalonePrice }),
    stockState: availability.state,
    quantity: availability.quantity,
  };
}

export const activeJacket = { material: { active: true } } satisfies Prisma.JacketColourwayWhereInput;
const jacketOrder = [{ material: { sortOrder: 'asc' } }, { id: 'asc' }] satisfies Prisma.JacketColourwayOrderByWithRelationInput[];

export async function getStandaloneJackets(): Promise<JacketProduct[]> {
  await connection();
  const rows = await getPrisma().jacketColourway.findMany({
    relationLoadStrategy: 'join',
    where: activeJacket,
    include: jacketInclude,
    orderBy: jacketOrder,
  });
  return rows.map(toJacket);
}

export async function getStandaloneJacket(id: string): Promise<JacketProductDetail | null> {
  await connection();
  const row = await getPrisma().jacketColourway.findFirst({
    relationLoadStrategy: 'join',
    where: { ...activeJacket, id },
    include: {
      ...jacketInclude,
      listings: {
        where: activeListing,
        select: { id: true, name: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  });
  if (!row) return null;
  return { ...toJacket(row), pairsWith: row.listings };
}

/**
 * The configurator's whole price table, resolved here so the client only
 * looks prices up (§7.1). Small by construction: designs × 2 materials ×
 * jacket colourways.
 */
export async function getConfiguratorCatalogue(): Promise<ConfiguratorCatalogue> {
  await connection();
  const prisma = getPrisma();
  const [designRows, jacketRows] = await Promise.all([
    prisma.sareeDesign.findMany({
      relationLoadStrategy: 'join',
      where: { active: true },
      include: { prices: { where: { material: { active: true } } } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
    prisma.jacketColourway.findMany({
      relationLoadStrategy: 'join',
      where: activeJacket,
      include: jacketInclude,
      orderBy: jacketOrder,
    }),
  ]);

  const quotes: Record<string, number> = {};
  const materialDeltas: Record<string, number> = {};
  const designs: ConfiguratorCatalogue['designs'] = [];

  for (const design of designRows) {
    const plain = design.prices.find((p) => p.materialId === 'plain');
    const superCotton = design.prices.find((p) => p.materialId === 'super');
    // A design is offered only when it is priced in both materials.
    if (!plain || !superCotton) continue;
    designs.push({ id: design.id, name: design.name, thumbnailUrl: design.patternAssetUrl ?? PLACEHOLDER_IMAGE });

    for (const jacket of jacketRows) {
      const addOn = jacket.material.pairingAddOn;
      const plainPrice = resolvePairedPrice({ matrixPrice: plain.price, jacketPairingAddOn: addOn });
      const superPrice = resolvePairedPrice({ matrixPrice: superCotton.price, jacketPairingAddOn: addOn });
      quotes[quoteKey(design.id, 'plain', jacket.id)] = plainPrice;
      quotes[quoteKey(design.id, 'super', jacket.id)] = superPrice;
      materialDeltas[deltaKey(design.id, jacket.id)] = superPrice - plainPrice;
    }
  }

  const jackets = jacketRows.map((row) => ({
    id: row.id,
    name: `${row.material.name} · ${row.colourName}`,
    materialName: row.material.name,
    colourName: row.colourName,
    swatchHex: row.colourHex,
    thumbnailUrl: row.swatchUrl ?? PLACEHOLDER_IMAGE,
    stockState: availabilityOf(row.stock).state,
  }));

  return { designs, jackets, quotes, materialDeltas };
}
