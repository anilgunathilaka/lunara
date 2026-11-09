import 'server-only';
import type { Prisma, StockMovementKind } from '@prisma/client';

/**
 * The stock ledger (docs/4-architecture.md §3.12). Every change to
 * stock_item.quantity goes through `moveStock`, inside the caller's
 * transaction, so the quantity and the line explaining it commit together
 * or not at all.
 */

type Tx = Prisma.TransactionClient;

export type Movement = {
  sku: string;
  delta: number;
  kind: StockMovementKind;
  actor: string;
  reference?: string | null;
  note?: string | null;
};

/**
 * Applies a relative change and records it. Never goes below zero: returns
 * false (and changes nothing) when there isn't enough stock to take.
 */
export async function moveStock(tx: Tx, m: Movement): Promise<boolean> {
  const { count } = await tx.stockItem.updateMany({
    where: { sku: m.sku, quantity: { gte: Math.max(0, -m.delta) } },
    data: { quantity: { increment: m.delta } },
  });
  if (count !== 1) return false;
  const { quantity } = await tx.stockItem.findUniqueOrThrow({ where: { sku: m.sku }, select: { quantity: true } });
  await tx.stockMovement.create({
    data: { sku: m.sku, kind: m.kind, delta: m.delta, balance: quantity, actor: m.actor, reference: m.reference ?? null, note: m.note ?? null },
  });
  return true;
}

/** Records the starting quantity of a stock row created in this transaction. */
export async function recordCreated(tx: Tx, sku: string, quantity: number, actor: string): Promise<void> {
  await tx.stockMovement.create({ data: { sku, kind: 'created', delta: quantity, balance: quantity, actor, note: null } });
}
