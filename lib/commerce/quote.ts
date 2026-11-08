import 'server-only';
import type { Prisma, PrismaClient } from '@prisma/client';
import { activeJacket, activeListing, jacketInclude, listingInclude } from '@/lib/catalogue/queries';
import { resolvePairedPrice, resolveStandaloneJacketPrice } from '@/lib/pricing/resolve';
import { COD_FEE, isDistrictId, zoneForDistrict } from './delivery';
import type { CartLineRef, OfferedPaymentMethod, QuoteLineInput } from './cart-ref';

/**
 * Resolves cart references into prices, SKUs and availability, and totals
 * them (docs/4-architecture.md §3.4). The client never prices anything: it
 * renders what this returns.
 */

type Db = PrismaClient | Prisma.TransactionClient;

/** Everything needed to write an ORDER_LINE. Server-side only (holds SKUs). */
export interface ResolvedLine {
  kind: CartLineRef['kind'];
  listingId?: string;
  designId?: string;
  materialId?: string;
  sareeColourwayId?: string;
  jacketColourwayId: string;
  sareeSku?: string;
  jacketSku: string;
  drape?: 'saree' | 'osariya';
  title: string;
  materialName?: string;
  sareeColourName?: string;
  jacketMaterialName: string;
  jacketColourName: string;
  unitPrice: number;
  /** Units purchasable: the scarcest SKU this line consumes. */
  available: number;
  /** Current STOCK_ITEM quantity per SKU this line consumes. */
  stockBySku: Record<string, number>;
}

export type LineStatus = 'ok' | 'insufficient' | 'unavailable';

/** What the client sees for a line. */
export interface QuotedLine {
  key: string;
  status: LineStatus;
  unitPrice?: number;
  /** Present when insufficient: how many can still be bought. */
  available?: number;
}

export interface CartQuote {
  lines: QuotedLine[];
  subtotal: number;
  /** Null until a district is chosen. */
  deliveryFee: number | null;
  codFee: number;
  total: number;
  estimate: { minDays: number; maxDays: number } | null;
  /** True only when every line is available in the requested quantity. */
  orderable: boolean;
}

function combinedKey(designId: string, materialId: string, colourName: string): string {
  return `${designId}|${materialId}|${colourName}`;
}

/** Loads every referenced row in three parallel queries (not per line). */
async function resolveRefs(db: Db, inputs: QuoteLineInput[]): Promise<Map<string, ResolvedLine>> {
  const listingIds = new Set<string>();
  const jacketIds = new Set<string>();
  const configured: { designId: string; materialId: string; colourName: string }[] = [];

  for (const { ref } of inputs) {
    if (ref.kind === 'listing') listingIds.add(ref.listingId);
    if (ref.kind === 'jacket') jacketIds.add(ref.jacketColourwayId);
    if (ref.kind === 'configured') {
      jacketIds.add(ref.jacketColourwayId);
      configured.push({ designId: ref.designId, materialId: ref.materialId, colourName: ref.colourName });
    }
  }

  const [listings, jackets, colourways] = await Promise.all([
    listingIds.size
      ? db.curatedListing.findMany({
          relationLoadStrategy: 'join',
          where: { ...activeListing, id: { in: [...listingIds] } },
          include: listingInclude,
        })
      : [],
    jacketIds.size
      ? db.jacketColourway.findMany({
          relationLoadStrategy: 'join',
          where: { ...activeJacket, id: { in: [...jacketIds] } },
          include: jacketInclude,
        })
      : [],
    configured.length
      ? db.sareeColourway.findMany({
          relationLoadStrategy: 'join',
          where: {
            OR: configured,
            design: { active: true },
            material: { active: true },
          },
          include: { design: true, material: true, price: true, stock: true },
        })
      : [],
  ]);

  const listingById = new Map(listings.map((row) => [row.id, row]));
  const jacketById = new Map(jackets.map((row) => [row.id, row]));
  const colourwayByCombo = new Map(
    colourways.map((row) => [combinedKey(row.designId, row.materialId, row.colourName), row]),
  );

  const resolved = new Map<string, ResolvedLine>();
  for (const { key, ref } of inputs) {
    if (ref.kind === 'listing') {
      const row = listingById.get(ref.listingId);
      if (!row) continue;
      const saree = row.sareeColourway;
      const jacket = row.jacketColourway;
      resolved.set(key, {
        kind: 'listing',
        listingId: row.id,
        designId: saree.designId,
        materialId: saree.materialId,
        sareeColourwayId: saree.id,
        jacketColourwayId: jacket.id,
        sareeSku: saree.sku,
        jacketSku: jacket.sku,
        title: row.name,
        materialName: saree.material.name,
        sareeColourName: saree.colourName,
        jacketMaterialName: jacket.material.name,
        jacketColourName: jacket.colourName,
        unitPrice: resolvePairedPrice({ matrixPrice: saree.price.price, jacketPairingAddOn: jacket.material.pairingAddOn }),
        available: Math.min(saree.stock.quantity, jacket.stock.quantity),
        stockBySku: { [saree.sku]: saree.stock.quantity, [jacket.sku]: jacket.stock.quantity },
      });
    } else if (ref.kind === 'jacket') {
      const jacket = jacketById.get(ref.jacketColourwayId);
      if (!jacket) continue;
      resolved.set(key, {
        kind: 'jacket',
        jacketColourwayId: jacket.id,
        jacketSku: jacket.sku,
        title: jacket.material.name,
        jacketMaterialName: jacket.material.name,
        jacketColourName: jacket.colourName,
        unitPrice: resolveStandaloneJacketPrice({ standalonePrice: jacket.material.standalonePrice }),
        available: jacket.stock.quantity,
        stockBySku: { [jacket.sku]: jacket.stock.quantity },
      });
    } else {
      const saree = colourwayByCombo.get(combinedKey(ref.designId, ref.materialId, ref.colourName));
      const jacket = jacketById.get(ref.jacketColourwayId);
      if (!saree || !jacket) continue;
      resolved.set(key, {
        kind: 'configured',
        designId: saree.designId,
        materialId: saree.materialId,
        sareeColourwayId: saree.id,
        jacketColourwayId: jacket.id,
        sareeSku: saree.sku,
        jacketSku: jacket.sku,
        drape: ref.drape,
        title: saree.design.name,
        materialName: saree.material.name,
        sareeColourName: saree.colourName,
        jacketMaterialName: jacket.material.name,
        jacketColourName: jacket.colourName,
        unitPrice: resolvePairedPrice({ matrixPrice: saree.price.price, jacketPairingAddOn: jacket.material.pairingAddOn }),
        available: Math.min(saree.stock.quantity, jacket.stock.quantity),
        stockBySku: { [saree.sku]: saree.stock.quantity, [jacket.sku]: jacket.stock.quantity },
      });
    }
  }
  return resolved;
}

/** Total units requested per SKU across all lines (two lines can share a jacket). */
export function demandBySku(lines: { resolved: ResolvedLine; quantity: number }[]): Map<string, number> {
  const demand = new Map<string, number>();
  for (const { resolved, quantity } of lines) {
    for (const sku of [resolved.sareeSku, resolved.jacketSku]) {
      if (sku) demand.set(sku, (demand.get(sku) ?? 0) + quantity);
    }
  }
  return demand;
}

export interface QuoteResult {
  quote: CartQuote;
  /** Resolved lines in input order, for order placement. Undefined where unavailable. */
  resolved: (ResolvedLine | undefined)[];
}

export async function buildQuote(
  db: Db,
  input: { lines: QuoteLineInput[]; district?: string; paymentMethod?: OfferedPaymentMethod },
): Promise<QuoteResult> {
  const resolvedByKey = await resolveRefs(db, input.lines);
  const resolved = input.lines.map((line) => resolvedByKey.get(line.key));

  // Real stock per SKU, so two lines sharing a SKU are judged together.
  const stockBySku = new Map<string, number>();
  for (const r of resolved) {
    if (r) for (const [sku, quantity] of Object.entries(r.stockBySku)) stockBySku.set(sku, quantity);
  }
  const demand = demandBySku(
    input.lines.flatMap((line, i) => (resolved[i] ? [{ resolved: resolved[i]!, quantity: line.quantity }] : [])),
  );

  let subtotal = 0;
  const lines: QuotedLine[] = input.lines.map((line, i) => {
    const r = resolved[i];
    if (!r || r.available <= 0) return { key: line.key, status: 'unavailable' };
    subtotal += r.unitPrice * line.quantity;
    const short = [r.sareeSku, r.jacketSku].some(
      (sku) => sku !== undefined && (demand.get(sku) ?? 0) > (stockBySku.get(sku) ?? 0),
    );
    return short
      ? { key: line.key, status: 'insufficient', unitPrice: r.unitPrice, available: r.available }
      : { key: line.key, status: 'ok', unitPrice: r.unitPrice };
  });

  const zone = input.district && isDistrictId(input.district) ? zoneForDistrict(input.district) : null;
  const deliveryFee = zone ? zone.fee : null;
  const codFee = input.paymentMethod === 'cod' ? COD_FEE : 0;

  return {
    quote: {
      lines,
      subtotal,
      deliveryFee,
      codFee,
      total: subtotal + (deliveryFee ?? 0) + codFee,
      estimate: zone ? { minDays: zone.minDays, maxDays: zone.maxDays } : null,
      orderable: lines.every((l) => l.status === 'ok'),
    },
    resolved,
  };
}
