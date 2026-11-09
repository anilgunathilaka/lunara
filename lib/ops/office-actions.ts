'use server';

import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { normaliseSriLankanMobile, type QuoteLineInput } from '@/lib/commerce/cart-ref';
import { buildQuote } from '@/lib/commerce/quote';
import { MAX_INSTALMENTS, OFFICE_ITEM_ROWS, balanceOf, dateOnly, splitEvenly, todayInSriLanka } from '@/lib/office/plan';
import { getPrisma } from '@/lib/prisma';
import { moveStock } from '@/lib/stock/movements';
import { OpsError, back, checkbox, langOf, run } from './flow';
import { requireStaffAction } from './staff';

/**
 * Office sales with instalment plans (docs/4-architecture.md §3.13).
 * Prices come from the shop's own resolver (buildQuote) — never typed in —
 * and any discount carries its reason. Stock leaves the same stock_item the
 * shop reads, through the ledger. Paid and outstanding are derived from
 * payments. Every write is staff-only, validated, transactional, audited.
 */

type Tx = Prisma.TransactionClient;

const MAX_UNITS = 20;
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

function saleNumber(): string {
  let suffix = '';
  for (let i = 0; i < 6; i += 1) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `OFF-${suffix}`;
}

async function audit(tx: Tx, actor: string, action: string, entityId: string, after: Prisma.InputJsonValue, before?: Prisma.InputJsonValue, note?: string) {
  await tx.auditLog.create({ data: { actor, action, entityType: 'office_sale', entityId, after, before, note } });
}

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/** Planned instalments from the form: due dates always, amounts either all given or all blank (split evenly). */
function readPlan(form: FormData, total: number, soldOn: string): { seq: number; dueDate: Date; amount: number }[] {
  const count = Number(str(form, 'instalments'));
  if (!Number.isInteger(count) || count < 1 || count > MAX_INSTALMENTS) throw new OpsError('invalid');
  const dues: string[] = [];
  const amounts: (number | null)[] = [];
  for (let i = 1; i <= count; i += 1) {
    const due = day.safeParse(str(form, `due_${i}`));
    if (!due.success) throw new OpsError('invalid');
    dues.push(due.data);
    const raw = str(form, `amount_${i}`);
    if (raw === '') amounts.push(null);
    else {
      const n = Number(raw);
      if (!Number.isInteger(n) || n <= 0) throw new OpsError('invalid');
      amounts.push(n);
    }
  }
  // Due dates run forward from the sale.
  if (dues[0]! < soldOn || dues.some((d, i) => i > 0 && d < dues[i - 1]!)) throw new OpsError('planDates');
  let final: number[];
  if (amounts.every((a) => a === null)) final = splitEvenly(total, count);
  else if (amounts.every((a) => a !== null)) final = amounts as number[];
  else throw new OpsError('planMismatch');
  if (final.reduce((n, a) => n + a, 0) !== total || final.some((a) => a <= 0)) throw new OpsError('planMismatch');
  return final.map((amount, i) => ({ seq: i + 1, dueDate: dateOnly(dues[i]!), amount }));
}

// ── New sale ──────────────────────────────────────────────────────────────

const saleSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().max(20),
  address: optionalText(500),
  customerNote: optionalText(300),
  soldOn: day,
  discount: z.coerce.number().int().min(0).max(10_000_000),
  discountReason: optionalText(200),
  note: optionalText(500),
  firstPayment: z.coerce.number().int().min(0).max(10_000_000),
  firstMethod: z.enum(['cash', 'bank_transfer', 'card', 'other']),
  firstReference: optionalText(100),
});

export async function createOfficeSaleAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/office/new`;
  const parsed = saleSchema.safeParse({
    ...Object.fromEntries(form),
    discount: str(form, 'discount') || 0,
    firstPayment: str(form, 'firstPayment') || 0,
    firstMethod: str(form, 'firstMethod') || 'cash',
  });
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;
  const phone = normaliseSriLankanMobile(input.phone);
  if (!phone) back(path, { error: 'phone' });
  const today = todayInSriLanka();
  if (input.soldOn > today) back(path, { error: 'invalid' });

  // Items: "listing:<id>" or "jacket:<id>", merged when repeated.
  const units = new Map<string, number>();
  for (let i = 0; i < OFFICE_ITEM_ROWS; i += 1) {
    const item = str(form, `item_${i}`);
    if (!item) continue;
    const qty = Number(str(form, `qty_${i}`) || 1);
    if (!/^(listing|jacket):[\w-]{1,100}$/.test(item) || !Number.isInteger(qty) || qty < 1 || qty > MAX_UNITS) back(path, { error: 'invalid' });
    units.set(item, (units.get(item) ?? 0) + qty);
  }
  if (units.size === 0 || [...units.values()].some((q) => q > MAX_UNITS)) back(path, { error: 'invalid' });
  const lines: QuoteLineInput[] = [...units].map(([item, quantity], i) => {
    const [kind, id] = item.split(':') as ['listing' | 'jacket', string];
    return { key: String(i), quantity, ref: kind === 'listing' ? { kind, listingId: id } : { kind, jacketColourwayId: id } };
  });

  await run(path, async () => {
    const prisma = getPrisma();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const number = saleNumber();
      try {
        await prisma.$transaction(async (tx) => {
          // The shop's own prices and availability: one source of truth.
          const { quote, resolved } = await buildQuote(tx, { lines });
          if (!quote.orderable) throw new OpsError('stock');
          const subtotal = quote.subtotal;
          if (input.discount > subtotal || (input.discount > 0 && !input.discountReason)) throw new OpsError('discount');
          const total = subtotal - input.discount;
          const plan = readPlan(form, total, input.soldOn);
          if (input.firstPayment > total) throw new OpsError('overpay');

          const customer = await tx.officeCustomer.upsert({
            where: { phone: phone! },
            create: { name: input.customerName, phone: phone!, address: input.address, note: input.customerNote },
            update: { name: input.customerName, ...(input.address ? { address: input.address } : {}), ...(input.customerNote ? { note: input.customerNote } : {}) },
          });

          const sale = await tx.officeSale.create({
            data: {
              number,
              customerId: customer.id,
              soldOn: dateOnly(input.soldOn),
              subtotal,
              discount: input.discount,
              discountReason: input.discount > 0 ? input.discountReason : null,
              total,
              note: input.note,
              soldBy: staff.email,
              lines: {
                create: lines.map((line, i) => {
                  const r = resolved[i]!;
                  return {
                    kind: line.ref.kind,
                    listingId: line.ref.kind === 'listing' ? line.ref.listingId : null,
                    jacketColourwayId: r.jacketColourwayId,
                    sareeSku: r.sareeSku ?? null,
                    jacketSku: r.jacketSku,
                    title: line.ref.kind === 'listing' ? r.title : `${r.jacketMaterialName} · ${r.jacketColourName}`,
                    unitPrice: r.unitPrice,
                    quantity: line.quantity,
                  };
                }),
              },
              instalments: { create: plan },
              ...(input.firstPayment > 0
                ? {
                    payments: {
                      create: { amount: input.firstPayment, method: input.firstMethod, paidOn: dateOnly(input.soldOn), reference: input.firstReference, receivedBy: staff.email },
                    },
                  }
                : {}),
            },
          });

          // Stock leaves the same stock_item the shop reads, recorded in the ledger.
          const demand = new Map<string, number>();
          lines.forEach((line, i) => {
            for (const sku of [resolved[i]!.sareeSku, resolved[i]!.jacketSku]) if (sku) demand.set(sku, (demand.get(sku) ?? 0) + line.quantity);
          });
          for (const [sku, quantity] of [...demand].sort(([a], [b]) => a.localeCompare(b))) {
            if (!(await moveStock(tx, { sku, delta: -quantity, kind: 'office_sale', actor: staff.email, reference: number }))) throw new OpsError('stock');
          }

          await audit(tx, staff.email, 'office.sale.create', sale.number, {
            customer: customer.id,
            subtotal,
            discount: input.discount,
            discountReason: input.discountReason,
            total,
            instalments: plan.map((p) => ({ due: p.dueDate.toISOString().slice(0, 10), amount: p.amount })),
            firstPayment: input.firstPayment,
          });
        });
        return `/${lang}/ops/office/${number}`;
      } catch (error) {
        // A clashing sale number: try another.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002' && String(error.meta?.target ?? '').includes('number')) continue;
        throw error;
      }
    }
    throw new OpsError('conflict');
  });
}

// ── Payments ──────────────────────────────────────────────────────────────

const paymentSchema = z.object({
  number: z.string().regex(/^OFF-[A-Z0-9]{6}$/),
  amount: z.coerce.number().int().min(1).max(10_000_000),
  method: z.enum(['cash', 'bank_transfer', 'card', 'other']),
  paidOn: day,
  reference: optionalText(100),
  note: optionalText(300),
});

const salePath = (lang: string, form: FormData) => `/${lang}/ops/office/${encodeURIComponent(str(form, 'number'))}`;

export async function recordPaymentAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = salePath(lang, form);
  const parsed = paymentSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success || parsed.data.paidOn > todayInSriLanka()) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      // Lock the sale row so two payments recorded at once can't both fit the same balance.
      await tx.$queryRaw`select id from office_sale where number = ${input.number} for update`;
      const sale = await tx.officeSale.findUnique({ where: { number: input.number }, include: { payments: true, instalments: true } });
      if (!sale) throw new OpsError('notFound');
      if (sale.status !== 'active') throw new OpsError('conflict');
      const { outstanding } = balanceOf(sale.total, sale.instalments, sale.payments, todayInSriLanka());
      if (input.amount > outstanding) throw new OpsError('overpay');
      const payment = await tx.officePayment.create({
        data: { saleId: sale.id, amount: input.amount, method: input.method, paidOn: dateOnly(input.paidOn), reference: input.reference, note: input.note, receivedBy: staff.email },
      });
      await audit(tx, staff.email, 'office.payment', sale.number, { payment: payment.id, amount: input.amount, method: input.method, paidOn: input.paidOn, outstandingAfter: outstanding - input.amount });
    });
  });
}

const voidSchema = z.object({
  number: z.string().regex(/^OFF-[A-Z0-9]{6}$/),
  paymentId: z.string().min(1).max(100),
  reason: z.string().trim().min(2).max(300),
});

export async function voidPaymentAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = salePath(lang, form);
  const parsed = voidSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const sale = await tx.officeSale.findUnique({ where: { number: input.number } });
      if (!sale) throw new OpsError('notFound');
      const { count } = await tx.officePayment.updateMany({
        where: { id: input.paymentId, saleId: sale.id, voidedAt: null },
        data: { voidedAt: new Date(), voidedBy: staff.email, voidReason: input.reason },
      });
      if (count !== 1) throw new OpsError('conflict');
      await audit(tx, staff.email, 'office.payment.void', sale.number, { payment: input.paymentId }, undefined, input.reason);
    });
  });
}

// ── Plan ──────────────────────────────────────────────────────────────────

export async function updatePlanAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = salePath(lang, form);
  const number = str(form, 'number');
  if (!/^OFF-[A-Z0-9]{6}$/.test(number)) back(path, { error: 'invalid' });

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const sale = await tx.officeSale.findUnique({ where: { number }, include: { instalments: { orderBy: { seq: 'asc' } } } });
      if (!sale) throw new OpsError('notFound');
      if (sale.status !== 'active') throw new OpsError('conflict');
      const plan = readPlan(form, sale.total, sale.soldOn.toISOString().slice(0, 10));
      await tx.officeInstalment.deleteMany({ where: { saleId: sale.id } });
      await tx.officeInstalment.createMany({ data: plan.map((p) => ({ ...p, saleId: sale.id })) });
      const view = (rows: { dueDate: Date; amount: number }[]) => rows.map((p) => ({ due: p.dueDate.toISOString().slice(0, 10), amount: p.amount }));
      await audit(tx, staff.email, 'office.plan.update', sale.number, view(plan), view(sale.instalments));
    });
  });
}

// ── Cancel ────────────────────────────────────────────────────────────────

const cancelSchema = z.object({
  number: z.string().regex(/^OFF-[A-Z0-9]{6}$/),
  reason: z.string().trim().min(2).max(300),
  confirm: checkbox,
});

export async function cancelOfficeSaleAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = salePath(lang, form);
  const parsed = cancelSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success || !parsed.data.confirm) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const sale = await tx.officeSale.findUnique({ where: { number: input.number }, include: { lines: true } });
      if (!sale) throw new OpsError('notFound');
      // Only moves if nobody cancelled it first.
      const { count } = await tx.officeSale.updateMany({
        where: { id: sale.id, status: 'active' },
        data: { status: 'cancelled', cancelledAt: new Date(), cancelledBy: staff.email, cancelReason: input.reason },
      });
      if (count !== 1) throw new OpsError('conflict');
      const units = new Map<string, number>();
      for (const line of sale.lines) for (const sku of [line.sareeSku, line.jacketSku]) if (sku) units.set(sku, (units.get(sku) ?? 0) + line.quantity);
      for (const [sku, quantity] of [...units].sort(([a], [b]) => a.localeCompare(b))) {
        await moveStock(tx, { sku, delta: quantity, kind: 'office_return', actor: staff.email, reference: sale.number, note: input.reason });
      }
      await audit(tx, staff.email, 'office.sale.cancel', sale.number, { status: 'cancelled' }, { status: 'active' }, input.reason);
    });
  });
}

// ── Customer details ──────────────────────────────────────────────────────

const customerSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(2).max(120),
  phone: z.string().max(20),
  address: optionalText(500),
  note: optionalText(300),
});

export async function updateOfficeCustomerAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/office/customers/${encodeURIComponent(str(form, 'id'))}`;
  const parsed = customerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;
  const phone = normaliseSriLankanMobile(input.phone);
  if (!phone) back(path, { error: 'phone' });

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const before = await tx.officeCustomer.findUnique({ where: { id: input.id } });
      if (!before) throw new OpsError('notFound');
      if (phone !== before.phone && (await tx.officeCustomer.findUnique({ where: { phone: phone! } }))) throw new OpsError('phoneTaken');
      await tx.officeCustomer.update({ where: { id: input.id }, data: { name: input.name, phone: phone!, address: input.address, note: input.note } });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'office.customer.update',
          entityType: 'office_customer',
          entityId: input.id,
          before: { name: before.name, phone: before.phone, address: before.address, note: before.note },
          after: { name: input.name, phone: phone!, address: input.address, note: input.note },
        },
      });
    });
  });
}
