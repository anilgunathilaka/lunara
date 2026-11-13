import 'server-only';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';

/**
 * PRD §8 success metrics, computed from orders, events and reviews already
 * recorded (docs/4-architecture.md §3.9). Aggregated in SQL: the Worker
 * never loops over every order. Metrics that need data not yet captured are
 * reported as such rather than estimated.
 */

/** Orders that count: everything except cancelled. */
const LIVE = Prisma.sql`o.status <> 'cancelled'`;
/** Reached the customer. Refunded orders did too, but their revenue was returned. */
const DELIVERED = ['delivered', 'return_requested', 'refunded', 'exchanged'] as const;
const RETURNED = ['return_requested', 'refunded', 'exchanged'] as const;

export interface Insights {
  since: Date | null;
  orders: { placed: number; cancelled: number; delivered: number; cod: number; bankTransfer: number };
  deliveredRevenue: number;
  /** North star (PRD §8.1): null when no customer is old enough to measure. */
  repeat: { months: 6 | 12; eligible: number; repeated: number }[];
  /** Saree units by saree category (PRD v4.0), named as they were when sold. */
  categories: { name: string; units: number }[];
  designs: { name: string; units: number }[];
  jacketAttachment: { ordersWithJacket: number; orders: number; jacketUnits: number };
  osariya: { osariyaUnits: number; configuredUnits: number };
  dispatch: { dispatched: number; onTime: number };
  returnsByColourway: { name: string; delivered: number; returned: number }[];
  codByDistrict: { district: string; orders: number; delivered: number; cancelled: number }[];
  reviews: { reviews: number; withPhotos: number; average: number | null; deliveredOrders: number };
}

const n = (value: unknown): number => (value === null || value === undefined ? 0 : Number(value));

export async function getInsights(days: number | null): Promise<Insights> {
  const prisma = getPrisma();
  const since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
  const inWindow = since ? Prisma.sql`o."createdAt" >= ${since}` : Prisma.sql`true`;
  const delivered = Prisma.join(DELIVERED.map((s) => Prisma.sql`${s}::"OrderStatus"`));
  const returned = Prisma.join(RETURNED.map((s) => Prisma.sql`${s}::"OrderStatus"`));

  const [orders, repeat, lines, designs, categories, dispatch, returns, cod, reviews] = await Promise.all([
    prisma.$queryRaw<Record<string, unknown>[]>`
      select count(*)::int as placed,
             count(*) filter (where o.status = 'cancelled')::int as cancelled,
             count(*) filter (where o.status in (${delivered}))::int as delivered,
             count(*) filter (where o."paymentMethod" = 'cod')::int as cod,
             count(*) filter (where o."paymentMethod" = 'bank_transfer')::int as bank,
             coalesce(sum(o.total) filter (where o.status in ('delivered', 'return_requested', 'exchanged')), 0)::bigint as revenue
      from "order" o where ${inWindow}`,

    // Customers are identified by phone (guest checkout is the norm). For N
    // months: of customers whose first order is at least N months old, how
    // many ordered again within N months of it. Always all-time: a cohort
    // cannot be cut by the date filter.
    prisma.$queryRaw<Record<string, unknown>[]>`
      with firsts as (
        select o.phone, min(o."createdAt") as first_at from "order" o where ${LIVE} group by o.phone
      )
      select m.months::int as months,
             count(*) filter (where f.first_at <= now() - make_interval(months => m.months))::int as eligible,
             count(*) filter (where f.first_at <= now() - make_interval(months => m.months) and exists (
               select 1 from "order" o2
               where o2.phone = f.phone and o2.status <> 'cancelled'
                 and o2."createdAt" > f.first_at
                 and o2."createdAt" <= f.first_at + make_interval(months => m.months)
             ))::int as repeated
      from firsts f cross join (values (6), (12)) as m(months)
      group by m.months order by m.months`,

    prisma.$queryRaw<Record<string, unknown>[]>`
      select coalesce(sum(l.quantity) filter (where l.kind in ('listing', 'configured')), 0)::int as saree_units,
             coalesce(sum(l.quantity) filter (where l.kind = 'jacket'), 0)::int as jacket_units,
             count(distinct o.id) filter (where l.kind = 'jacket')::int as orders_with_jacket,
             count(distinct o.id)::int as orders,
             coalesce(sum(l.quantity) filter (where l.kind = 'configured' and l.drape = 'osariya'), 0)::int as osariya_units,
             coalesce(sum(l.quantity) filter (where l.kind = 'configured'), 0)::int as configured_units
      from "order" o join order_line l on l."orderId" = o.id
      where ${LIVE} and ${inWindow}`,

    prisma.$queryRaw<Record<string, unknown>[]>`
      select coalesce(d.name, l."designId") as name, sum(l.quantity)::int as units
      from "order" o join order_line l on l."orderId" = o.id
      left join saree_design d on d.id = l."designId"
      where ${LIVE} and ${inWindow} and l."designId" is not null
      group by 1 order by units desc, name limit 20`,

    prisma.$queryRaw<Record<string, unknown>[]>`
      select coalesce(l."materialName", l."materialId") as name, sum(l.quantity)::int as units
      from "order" o join order_line l on l."orderId" = o.id
      where ${LIVE} and ${inWindow} and l.kind in ('listing', 'configured') and l."materialId" is not null
      group by 1 order by units desc, name`,

    // On time: dispatched on the day it became ready, or the next day,
    // Colombo time (PRD: same-day or next-day dispatch). Ready = confirmed.
    prisma.$queryRaw<Record<string, unknown>[]>`
      with ready as (
        select e."orderId", min(e."createdAt") as at from order_event e where e.status = 'confirmed' group by e."orderId"
      ), shipped as (
        select e."orderId", min(e."createdAt") as at from order_event e where e.status = 'dispatched' group by e."orderId"
      )
      select count(*)::int as dispatched,
             count(*) filter (where (s.at at time zone 'Asia/Colombo')::date
                                <= (r.at at time zone 'Asia/Colombo')::date + 1)::int as on_time
      from "order" o join shipped s on s."orderId" = o.id join ready r on r."orderId" = o.id
      where ${inWindow}`,

    prisma.$queryRaw<Record<string, unknown>[]>`
      select concat_ws(' · ', l.title, l."materialName", l."sareeColourName") as name,
             count(distinct o.id) filter (where o.status in (${delivered}))::int as delivered,
             count(distinct o.id) filter (where o.status in (${returned}))::int as returned
      from "order" o join order_line l on l."orderId" = o.id
      where ${inWindow} and l."sareeSku" is not null
      group by 1 having count(distinct o.id) filter (where o.status in (${delivered})) > 0
      order by returned desc, delivered desc limit 20`,

    prisma.$queryRaw<Record<string, unknown>[]>`
      select o.district, count(*)::int as orders,
             count(*) filter (where o.status in (${delivered}))::int as delivered,
             count(*) filter (where o.status = 'cancelled')::int as cancelled
      from "order" o where o."paymentMethod" = 'cod' and ${inWindow}
      group by o.district order by orders desc, o.district`,

    prisma.$queryRaw<Record<string, unknown>[]>`
      select count(r.id)::int as reviews,
             count(r.id) filter (where cardinality(r.photos) > 0)::int as with_photos,
             round(avg(r.rating)::numeric, 1)::float as average
      from review r join "order" o on o.id = r."orderId"
      where r.status = 'published' and ${inWindow}`,
  ]);

  const o = orders[0] ?? {};
  const l = lines[0] ?? {};
  const d = dispatch[0] ?? {};
  const r = reviews[0] ?? {};
  return {
    since,
    orders: { placed: n(o.placed), cancelled: n(o.cancelled), delivered: n(o.delivered), cod: n(o.cod), bankTransfer: n(o.bank) },
    deliveredRevenue: n(o.revenue),
    // Both horizons always appear: with no customers yet the query returns no rows at all.
    repeat: ([6, 12] as const).map((months) => {
      const row = repeat.find((r) => n(r.months) === months);
      return { months, eligible: n(row?.eligible), repeated: n(row?.repeated) };
    }),
    categories: categories.map((row) => ({ name: String(row.name), units: n(row.units) })),
    designs: designs.map((row) => ({ name: String(row.name), units: n(row.units) })),
    jacketAttachment: { ordersWithJacket: n(l.orders_with_jacket), orders: n(l.orders), jacketUnits: n(l.jacket_units) },
    osariya: { osariyaUnits: n(l.osariya_units), configuredUnits: n(l.configured_units) },
    dispatch: { dispatched: n(d.dispatched), onTime: n(d.on_time) },
    returnsByColourway: returns.map((row) => ({ name: String(row.name), delivered: n(row.delivered), returned: n(row.returned) })),
    codByDistrict: cod.map((row) => ({ district: String(row.district), orders: n(row.orders), delivered: n(row.delivered), cancelled: n(row.cancelled) })),
    reviews: { reviews: n(r.reviews), withPhotos: n(r.with_photos), average: r.average === null || r.average === undefined ? null : Number(r.average), deliveredOrders: n(o.delivered) },
  };
}

/** A share as a whole percent, or null when there is nothing to divide by. */
export function percent(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;
}
