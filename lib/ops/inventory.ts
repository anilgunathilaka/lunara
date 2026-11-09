import 'server-only';
import { totalCost } from '@/lib/costing/cost';
import { getPrisma } from '@/lib/prisma';
import { soldInOfficeBySku } from './office';
import { resolveStandaloneJacketPrice } from '@/lib/pricing/resolve';
import { availabilityOf } from '@/lib/stock/state';

/**
 * Inventory in one place (docs/4-architecture.md §3.12): on hand, sold,
 * value at cost and at price, for every SKU, from the same stock_item rows
 * the shop reads. Sold counts come from the orders themselves; the
 * movement ledger explains each change.
 */

export type InventoryRow = {
  sku: string;
  kind: 'saree' | 'jacket';
  name: string;
  /** Where staff edit the product, when there is one. */
  editHref: string | null;
  active: boolean;
  quantity: number;
  threshold: number;
  state: 'in' | 'low' | 'out';
  soldOnline: number;
  soldOffice: number;
  unitCost: number | null;
  unitPrice: number;
  costValue: number | null;
  priceValue: number;
};

/** Units sold online per SKU: every website order line except cancelled orders. */
async function soldOnlineBySku(): Promise<Map<string, number>> {
  const rows = await getPrisma().$queryRaw<{ sku: string; units: bigint }[]>`
    select sku, sum(quantity)::bigint as units from (
      select l."sareeSku" as sku, l.quantity from order_line l join "order" o on o.id = l."orderId"
        where o.status <> 'cancelled' and l."sareeSku" is not null
      union all
      select l."jacketSku" as sku, l.quantity from order_line l join "order" o on o.id = l."orderId"
        where o.status <> 'cancelled'
    ) s group by sku`;
  return new Map(rows.map((r) => [r.sku, Number(r.units)]));
}

export async function inventoryRows(): Promise<{ rows: InventoryRow[]; totals: { units: number; soldOnline: number; soldOffice: number; costValue: number; priceValue: number; missingCost: number } }> {
  const prisma = getPrisma();
  const [items, sold, office] = await Promise.all([
    prisma.stockItem.findMany({
      relationLoadStrategy: 'join',
      orderBy: { sku: 'asc' },
      include: {
        cost: true,
        sareeColourway: { include: { design: true, material: true, price: true, listings: { select: { id: true, active: true }, orderBy: { sortOrder: 'asc' } } } },
        jacketColourway: { include: { material: true } },
      },
    }),
    soldOnlineBySku(),
    soldInOfficeBySku(),
  ]);

  const rows: InventoryRow[] = items.map((item) => {
    const saree = item.sareeColourway;
    const jacket = item.jacketColourway;
    const unitCost = item.cost ? totalCost(item.cost) : null;
    // A saree's own value is its design × cotton price; a jacket's is its price on its own.
    const unitPrice = saree ? saree.price.price : jacket ? resolveStandaloneJacketPrice({ standalonePrice: jacket.material.standalonePrice }) : 0;
    const listing = saree?.listings[0];
    return {
      sku: item.sku,
      kind: saree ? 'saree' : 'jacket',
      name: saree ? `${saree.design.name} · ${saree.material.name} · ${saree.colourName}` : jacket ? `${jacket.material.name} · ${jacket.colourName}` : item.sku,
      editHref: listing ? `/ops/products/${listing.id}` : jacket ? `/ops/products/jackets/${jacket.id}` : null,
      active: saree ? saree.active : jacket ? jacket.active : false,
      quantity: item.quantity,
      threshold: item.threshold,
      state: availabilityOf(item).state,
      soldOnline: sold.get(item.sku) ?? 0,
      soldOffice: office.get(item.sku) ?? 0,
      unitCost,
      unitPrice,
      costValue: unitCost === null ? null : unitCost * item.quantity,
      priceValue: unitPrice * item.quantity,
    };
  });
  rows.sort((a, b) => (a.kind === b.kind ? Number(b.active) - Number(a.active) || a.name.localeCompare(b.name) : a.kind === 'saree' ? -1 : 1));

  return {
    rows,
    totals: {
      units: rows.reduce((n, r) => n + r.quantity, 0),
      soldOnline: rows.reduce((n, r) => n + r.soldOnline, 0),
      soldOffice: rows.reduce((n, r) => n + r.soldOffice, 0),
      costValue: rows.reduce((n, r) => n + (r.costValue ?? 0), 0),
      priceValue: rows.reduce((n, r) => n + r.priceValue, 0),
      missingCost: rows.filter((r) => r.unitCost === null && r.quantity > 0).length,
    },
  };
}

/** One SKU and its most recent movements, newest first. */
export async function inventoryHistory(sku: string, limit = 200) {
  const { rows } = await inventoryRows();
  const row = rows.find((r) => r.sku === sku);
  if (!row) return null;
  const movements = await getPrisma().stockMovement.findMany({ where: { sku }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: limit });
  return { row, movements };
}
