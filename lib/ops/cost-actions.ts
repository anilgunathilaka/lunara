'use server';

import { z } from 'zod';
import { COST_PARTS } from '@/lib/costing/cost';
import { getPrisma } from '@/lib/prisma';
import { OpsError, back, langOf, opsLocale, run } from './flow';
import { requireStaffAction } from './staff';

/**
 * Saves the unit cost of one saree or jacket colour (docs/4-architecture.md
 * §3.11). The SKU is looked up from the product, never taken from the form.
 * Staff-only, validated, transactional, audited.
 */

const amount = z.coerce.number().int().min(0).max(1_000_000);

const schema = z.object({
  locale: opsLocale,
  kind: z.enum(['saree', 'jacket']),
  id: z.string().min(1).max(100),
  fabric: amount,
  otherMaterials: amount,
  sewing: amount,
  transport: amount,
  other: amount,
  note: z.string().trim().max(300).optional(),
});

export async function saveCostAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const kind = form.get('kind') === 'jacket' ? 'jacket' : 'saree';
  const id = String(form.get('id') ?? '');
  const path = `/${lang}/ops/products/${kind === 'jacket' ? 'jackets/' : ''}${encodeURIComponent(id)}`;
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;
  const values = Object.fromEntries(COST_PARTS.map((part) => [part, input[part]])) as Record<(typeof COST_PARTS)[number], number>;
  const note = input.note ? input.note : null;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const sku =
        input.kind === 'jacket'
          ? (await tx.jacketColourway.findUnique({ where: { id: input.id }, select: { sku: true } }))?.sku
          : (await tx.curatedListing.findUnique({ where: { id: input.id }, select: { sareeColourway: { select: { sku: true } } } }))?.sareeColourway.sku;
      if (!sku) throw new OpsError('notFound');
      const before = await tx.productCost.findUnique({ where: { sku } });
      await tx.productCost.upsert({
        where: { sku },
        create: { sku, ...values, note, updatedBy: staff.email },
        update: { ...values, note, updatedBy: staff.email },
      });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'cost.update',
          entityType: 'product_cost',
          entityId: sku,
          after: { ...values, note },
          before: before ? { ...Object.fromEntries(COST_PARTS.map((p) => [p, before[p]])), note: before.note } : undefined,
        },
      });
    });
  });
}
