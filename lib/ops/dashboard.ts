import 'server-only';
import type { OrderStatus } from '@prisma/client';
import { todayInSriLanka } from '@/lib/office/plan';
import { getPrisma } from '@/lib/prisma';
import { officeSaleList } from '@/lib/ops/office';
import { messageQueue, paymentQueue, stockRows } from '@/lib/ops/queries';

/**
 * The operations dashboard (docs/4-architecture.md §3.14): one read of what
 * needs attention now and how the last 30 days went. Every figure comes from
 * the same records the other ops pages read; nothing is stored twice.
 */

/** Orders that still need a staff action, in the order they move. */
export const ACTION_STATUSES = ['placed', 'payment_pending', 'confirmed', 'packed'] as const satisfies readonly OrderStatus[];
/** Orders that never became a sale. */
const NOT_SALES: ReadonlySet<OrderStatus> = new Set(['cancelled', 'refunded']);

const DAYS = 30;
const MS_PER_DAY = 86_400_000;

/** YYYY-MM-DD of a moment, in Sri Lanka. */
function slDay(date: Date): string {
  return todayInSriLanka(date);
}

export interface DayPoint {
  day: string;
  total: number;
  orders: number;
}

export async function dashboardSnapshot() {
  const prisma = getPrisma();
  const now = new Date();
  const since = new Date(now.getTime() - DAYS * 2 * MS_PER_DAY);
  const reviewSince = new Date(now.getTime() - 7 * MS_PER_DAY);

  const [byStatus, recentRows, payments, messages, stock, office, reviewsWeek, recentOrders] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { total: true, status: true, createdAt: true } }),
    paymentQueue(),
    messageQueue(),
    stockRows(),
    officeSaleList('open'),
    prisma.review.count({ where: { createdAt: { gte: reviewSince } } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { number: true, status: true, customerName: true, total: true, createdAt: true },
    }),
  ]);

  const statusCount = Object.fromEntries(byStatus.map((g) => [g.status, g._count._all])) as Partial<Record<OrderStatus, number>>;
  const needsAction = ACTION_STATUSES.map((status) => ({ status, count: statusCount[status] ?? 0 }));

  // Daily online sales for the last 30 Sri Lankan days, and the 30 before for comparison.
  const today = slDay(now);
  const days: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) days.push(slDay(new Date(now.getTime() - i * MS_PER_DAY)));
  const firstDay = days[0]!;
  const series = new Map<string, DayPoint>(days.map((day) => [day, { day, total: 0, orders: 0 }]));
  let previousTotal = 0;
  let previousOrders = 0;
  for (const row of recentRows) {
    if (NOT_SALES.has(row.status)) continue;
    const day = slDay(row.createdAt);
    const point = series.get(day);
    if (point) {
      point.total += row.total;
      point.orders += 1;
    } else if (day < firstDay) {
      previousTotal += row.total;
      previousOrders += 1;
    }
  }
  const points = [...series.values()];
  const total = points.reduce((n, p) => n + p.total, 0);
  const orders = points.reduce((n, p) => n + p.orders, 0);
  const todayPoint = series.get(today) ?? { day: today, total: 0, orders: 0 };

  const low = stock.filter((row) => row.state !== 'in').sort((a, b) => a.quantity - b.quantity);

  return {
    needsAction,
    actionTotal: needsAction.reduce((n, s) => n + s.count, 0),
    payments: {
      count: payments.length,
      total: payments.reduce((n, p) => n + p.total, 0),
      oldest: payments[0]?.createdAt ?? null,
    },
    messages: messages.length,
    sales: {
      points,
      total,
      orders,
      average: orders > 0 ? Math.round(total / orders) : 0,
      today: todayPoint,
      previousTotal,
      previousOrders,
    },
    stock: {
      out: stock.filter((row) => row.state === 'out').length,
      low: stock.filter((row) => row.state === 'low').length,
      items: low.slice(0, 5),
    },
    office: office.totals,
    reviewsWeek,
    recentOrders,
  };
}

export type DashboardSnapshot = Awaited<ReturnType<typeof dashboardSnapshot>>;

/** Counts beside the sidebar's sections: what is waiting for someone. Three small counts. */
export async function opsBadges() {
  const prisma = getPrisma();
  const [orders, payments, messages] = await Promise.all([
    prisma.order.count({ where: { status: { in: [...ACTION_STATUSES] } } }),
    prisma.order.count({ where: { status: 'payment_pending' } }),
    prisma.notification.count({ where: { OR: [{ status: 'manual', dueAt: { lte: new Date() } }, { status: 'failed' }] } }),
  ]);
  return { orders, payments, messages };
}
