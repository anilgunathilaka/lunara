import 'server-only';
import { marginOf, totalCost, type CostBreakdown } from '@/lib/costing/cost';
import { getPrisma } from '@/lib/prisma';
import { resolvePairedPrice, resolveStandaloneJacketPrice } from '@/lib/pricing/resolve';

/**
 * Cost and margin reads (docs/4-architecture.md §3.11). A SKU with no cost
 * row is "not entered" — never treated as free.
 */

type CostRow = (CostBreakdown & { note: string | null; updatedBy: string; updatedAt: Date }) | null;

function unit(cost: CostRow): number | null {
  return cost ? totalCost(cost) : null;
}

export async function costOverview() {
  const prisma = getPrisma();
  const [listings, jackets] = await Promise.all([
    prisma.curatedListing.findMany({
      relationLoadStrategy: 'join',
      where: { active: true, sareeColourway: { active: true } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        sareeColourway: { include: { design: true, material: true, price: true, stock: { include: { cost: true } } } },
        jacketColourway: { include: { material: true, stock: { include: { cost: true } } } },
      },
    }),
    prisma.jacketColourway.findMany({
      relationLoadStrategy: 'join',
      where: { active: true },
      orderBy: [{ material: { sortOrder: 'asc' } }, { id: 'asc' }],
      include: { material: true, stock: { include: { cost: true } } },
    }),
  ]);

  const sarees = listings.map((row) => {
    const saree = row.sareeColourway;
    const jacket = row.jacketColourway;
    const price = resolvePairedPrice({ matrixPrice: saree.price.price, jacketPairingAddOn: jacket.material.pairingAddOn });
    const sareeCost = unit(saree.stock.cost);
    const jacketCost = unit(jacket.stock.cost);
    const cost = sareeCost !== null && jacketCost !== null ? sareeCost + jacketCost : null;
    return {
      id: row.id,
      name: row.name,
      detail: `${saree.design.name} · ${saree.material.name} · ${saree.colourName}`,
      jacket: `${jacket.material.name} · ${jacket.colourName}`,
      jacketId: jacket.id,
      price,
      sareeCost,
      jacketCost,
      cost,
      margin: cost === null ? null : marginOf(price, cost),
    };
  });

  const jacketRows = jackets.map((row) => {
    const price = resolveStandaloneJacketPrice({ standalonePrice: row.material.standalonePrice });
    const cost = unit(row.stock.cost);
    return {
      id: row.id,
      name: `${row.material.name} · ${row.colourName}`,
      sku: row.sku,
      price,
      cost,
      margin: cost === null ? null : marginOf(price, cost),
    };
  });

  return {
    sarees,
    jackets: jacketRows,
    missing: sarees.filter((s) => s.sareeCost === null).length + jacketRows.filter((j) => j.cost === null).length,
  };
}

/** The cost record for one SKU, for the edit forms. */
export async function costForSku(sku: string) {
  return getPrisma().productCost.findUnique({ where: { sku } });
}
