import 'server-only';
import type { OrderStatus, Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { availabilityOf } from '@/lib/stock/state';

/** Reads for the operations panel (docs/4-architecture.md §3.5). One query each. */

export async function listOrders(status?: OrderStatus) {
  return getPrisma().order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      number: true,
      status: true,
      paymentMethod: true,
      customerName: true,
      district: true,
      total: true,
      createdAt: true,
    },
  });
}

const orderDetailInclude = {
  lines: { orderBy: { id: 'asc' } },
  events: { orderBy: { createdAt: 'asc' } },
  notifications: { orderBy: [{ dueAt: 'asc' }, { channel: 'asc' }] },
} satisfies Prisma.OrderInclude;

export async function getOrderDetail(number: string) {
  return getPrisma().order.findUnique({
    relationLoadStrategy: 'join',
    where: { number },
    include: orderDetailInclude,
  });
}

/** Due messages staff must send by hand, plus automatic ones that gave up (§6.1). */
export async function messageQueue() {
  return getPrisma().notification.findMany({
    relationLoadStrategy: 'join',
    where: { OR: [{ status: 'manual', dueAt: { lte: new Date() } }, { status: 'failed' }] },
    orderBy: { dueAt: 'asc' },
    take: 200,
    include: { order: { select: { number: true, customerName: true } } },
  });
}

export async function paymentQueue() {
  return getPrisma().order.findMany({
    where: { status: 'payment_pending' },
    orderBy: { createdAt: 'asc' },
    select: { number: true, customerName: true, phone: true, total: true, createdAt: true },
  });
}

export interface StockRow {
  sku: string;
  kind: 'saree' | 'jacket';
  name: string;
  quantity: number;
  threshold: number;
  state: 'in' | 'low' | 'out';
}

export async function stockRows(): Promise<StockRow[]> {
  const rows = await getPrisma().stockItem.findMany({
    relationLoadStrategy: 'join',
    orderBy: { sku: 'asc' },
    include: {
      sareeColourway: { include: { design: true, material: true } },
      jacketColourway: { include: { material: true } },
    },
  });
  return rows.map((row) => {
    const saree = row.sareeColourway;
    const jacket = row.jacketColourway;
    const name = saree
      ? `${saree.design.name} · ${saree.material.name} · ${saree.colourName}`
      : jacket
        ? `${jacket.material.name} · ${jacket.colourName}`
        : row.sku;
    return {
      sku: row.sku,
      kind: saree ? 'saree' : 'jacket',
      name,
      quantity: row.quantity,
      threshold: row.threshold,
      state: availabilityOf(row).state,
    };
  });
}

export async function priceTables() {
  const prisma = getPrisma();
  const [designs, materials, jackets] = await Promise.all([
    prisma.sareeDesign.findMany({
      relationLoadStrategy: 'join',
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { prices: true },
    }),
    prisma.cottonMaterial.findMany({ orderBy: { id: 'asc' } }),
    prisma.jacketMaterial.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
  ]);
  return { designs, materials, jackets };
}
