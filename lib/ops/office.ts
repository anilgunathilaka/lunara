import 'server-only';
import { balanceOf, dayOf, todayInSriLanka } from '@/lib/office/plan';
import { getPrisma } from '@/lib/prisma';
import { resolvePairedPrice, resolveStandaloneJacketPrice } from '@/lib/pricing/resolve';

/** Office sale reads (docs/4-architecture.md §3.13). Balances are always derived from payments. */

export const OFFICE_FILTERS = ['open', 'overdue', 'paid', 'cancelled', 'all'] as const;
export type OfficeFilter = (typeof OFFICE_FILTERS)[number];

const withMoney = { customer: true, instalments: { orderBy: { seq: 'asc' as const } }, payments: { orderBy: [{ paidOn: 'asc' as const }, { createdAt: 'asc' as const }] } };

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return dayOf(d);
}

export async function officeSaleList(filter: OfficeFilter) {
  const today = todayInSriLanka();
  const weekAhead = addDays(today, 7);
  const sales = await getPrisma().officeSale.findMany({ relationLoadStrategy: 'join', orderBy: [{ soldOn: 'desc' }, { createdAt: 'desc' }], include: withMoney });
  const rows = sales.map((sale) => ({ sale, balance: balanceOf(sale.total, sale.instalments, sale.payments, today) }));
  const active = rows.filter((r) => r.sale.status === 'active');

  const shown = rows.filter(({ sale, balance }) => {
    switch (filter) {
      case 'open':
        return sale.status === 'active' && balance.outstanding > 0;
      case 'overdue':
        return sale.status === 'active' && balance.overdue > 0;
      case 'paid':
        return sale.status === 'active' && balance.outstanding <= 0;
      case 'cancelled':
        return sale.status === 'cancelled';
      default:
        return true;
    }
  });

  return {
    rows: shown,
    totals: {
      outstanding: active.reduce((n, r) => n + Math.max(0, r.balance.outstanding), 0),
      overdue: active.reduce((n, r) => n + r.balance.overdue, 0),
      overdueSales: active.filter((r) => r.balance.overdue > 0).length,
      dueThisWeek: active.reduce(
        (n, r) => n + r.balance.instalments.filter((i) => i.state !== 'paid' && i.state !== 'overdue' && dayOf(i.dueDate) <= weekAhead).reduce((m, i) => m + i.remaining, 0),
        0,
      ),
      openSales: active.filter((r) => r.balance.outstanding > 0).length,
    },
  };
}

export async function officeSaleDetail(number: string) {
  const sale = await getPrisma().officeSale.findUnique({ relationLoadStrategy: 'join', where: { number }, include: { ...withMoney, lines: true } });
  if (!sale) return null;
  const today = todayInSriLanka();
  return { sale, balance: balanceOf(sale.total, sale.instalments, sale.payments, today), today };
}

export async function officeCustomerDetail(id: string) {
  const customer = await getPrisma().officeCustomer.findUnique({
    relationLoadStrategy: 'join',
    where: { id },
    include: { sales: { orderBy: [{ soldOn: 'desc' }, { createdAt: 'desc' }], include: { instalments: true, payments: true } } },
  });
  if (!customer) return null;
  const today = todayInSriLanka();
  const sales = customer.sales.map((sale) => ({ sale, balance: balanceOf(sale.total, sale.instalments, sale.payments, today) }));
  const active = sales.filter((s) => s.sale.status === 'active');
  return {
    customer,
    sales,
    totals: {
      bought: active.reduce((n, s) => n + s.sale.total, 0),
      paid: active.reduce((n, s) => n + s.balance.paid, 0),
      outstanding: active.reduce((n, s) => n + Math.max(0, s.balance.outstanding), 0),
    },
  };
}

export async function officeCustomerList() {
  const today = todayInSriLanka();
  const customers = await getPrisma().officeCustomer.findMany({
    relationLoadStrategy: 'join',
    orderBy: { name: 'asc' },
    include: { sales: { where: { status: 'active' }, include: { instalments: true, payments: true } } },
  });
  return customers.map((c) => {
    const balances = c.sales.map((s) => balanceOf(s.total, s.instalments, s.payments, today));
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      sales: c.sales.length,
      outstanding: balances.reduce((n, b) => n + Math.max(0, b.outstanding), 0),
      overdue: balances.reduce((n, b) => n + b.overdue, 0),
    };
  });
}

/** What can be sold in the office: the live shop products and jackets, at their shop prices. */
export async function officeItemOptions() {
  const prisma = getPrisma();
  const [listings, jackets] = await Promise.all([
    prisma.curatedListing.findMany({
      relationLoadStrategy: 'join',
      where: { active: true, sareeColourway: { active: true }, jacketColourway: { active: true } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { sareeColourway: { include: { price: true, stock: true } }, jacketColourway: { include: { material: true, stock: true } } },
    }),
    prisma.jacketColourway.findMany({
      relationLoadStrategy: 'join',
      where: { active: true, material: { active: true } },
      orderBy: [{ material: { sortOrder: 'asc' } }, { id: 'asc' }],
      include: { material: true, stock: true },
    }),
  ]);
  return {
    sarees: listings.map((l) => ({
      value: `listing:${l.id}`,
      name: l.name,
      price: resolvePairedPrice({ matrixPrice: l.sareeColourway.price.price, jacketPairingAddOn: l.jacketColourway.material.pairingAddOn }),
      available: Math.min(l.sareeColourway.stock.quantity, l.jacketColourway.stock.quantity),
    })),
    jackets: jackets.map((j) => ({
      value: `jacket:${j.id}`,
      name: `${j.material.name} · ${j.colourName}`,
      price: resolveStandaloneJacketPrice({ standalonePrice: j.material.standalonePrice }),
      available: j.stock.quantity,
    })),
  };
}

/** Units sold in the office per SKU (sales not cancelled), for the inventory page. */
export async function soldInOfficeBySku(): Promise<Map<string, number>> {
  const rows = await getPrisma().$queryRaw<{ sku: string; units: bigint }[]>`
    select sku, sum(quantity)::bigint as units from (
      select l."sareeSku" as sku, l.quantity from office_sale_line l join office_sale s on s.id = l."saleId"
        where s.status = 'active' and l."sareeSku" is not null
      union all
      select l."jacketSku" as sku, l.quantity from office_sale_line l join office_sale s on s.id = l."saleId"
        where s.status = 'active'
    ) x group by sku`;
  return new Map(rows.map((r) => [r.sku, Number(r.units)]));
}
