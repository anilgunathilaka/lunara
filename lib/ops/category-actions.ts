'use server';

import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import { codePrefixFor } from '@/lib/catalogue/product-code';
import { OpsError, back, langOf, opsLocale, run, slugify, uniqueValue } from './flow';
import { requireStaffAction } from './staff';

/**
 * Saree categories (PRD v4.0, founder decision 2026-11-14): staff add a
 * category, and its product-code prefix is formed from its name by the rule
 * in lib/catalogue/product-code.ts; they correct a category's name, GSM,
 * opacity and length. The prefix and the running number are never edited:
 * codes already given must stay unique. Staff-only, validated, audited.
 */

const opacity = z.enum(['opaque', 'semi_sheer', 'sheer']);
const fields = {
  locale: opsLocale,
  name: z.string().trim().min(2).max(60),
  gsm: z.coerce.number().int().min(20).max(1000),
  opacity,
  lengthMetres: z.coerce.number().min(1).max(20),
};

const createSchema = z.object(fields);

export async function createCategoryAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products/categories`;
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const existing = await tx.cottonMaterial.findMany({ select: { name: true, codePrefix: true, sortOrder: true } });
      if (existing.some((c) => c.name.trim().toLowerCase() === input.name.toLowerCase())) throw new OpsError('exists');
      const prefix = codePrefixFor(input.name, existing.flatMap((c) => (c.codePrefix ? [c.codePrefix] : [])));
      if (!prefix) throw new OpsError('invalid');
      const id = await uniqueValue(slugify(input.name), async (v) => !!(await tx.cottonMaterial.findUnique({ where: { id: v } })));
      const sortOrder = Math.max(0, ...existing.map((c) => c.sortOrder)) + 1;
      await tx.cottonMaterial.create({
        data: { id, name: input.name, gsm: input.gsm, opacity: input.opacity, lengthMetres: input.lengthMetres, codePrefix: prefix, sortOrder },
      });
      await tx.auditLog.create({
        data: { actor: staff.email, action: 'category.create', entityType: 'cotton_material', entityId: id, after: { ...input, locale: undefined, codePrefix: prefix } },
      });
    });
  });
}

const updateSchema = z.object({ ...fields, id: z.string().min(1).max(100) });

export async function updateCategoryAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products/categories`;
  const parsed = updateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const input = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const current = await tx.cottonMaterial.findUnique({ where: { id: input.id } });
      if (!current || !current.codePrefix) throw new OpsError('notFound');
      const clash = await tx.cottonMaterial.findFirst({
        where: { id: { not: input.id }, name: { equals: input.name, mode: 'insensitive' } },
      });
      if (clash) throw new OpsError('exists');
      await tx.cottonMaterial.update({
        where: { id: input.id },
        data: { name: input.name, gsm: input.gsm, opacity: input.opacity, lengthMetres: input.lengthMetres },
      });
      await tx.auditLog.create({
        data: {
          actor: staff.email,
          action: 'category.update',
          entityType: 'cotton_material',
          entityId: input.id,
          before: { name: current.name, gsm: current.gsm, opacity: current.opacity, lengthMetres: current.lengthMetres.toNumber() },
          after: { name: input.name, gsm: input.gsm, opacity: input.opacity, lengthMetres: input.lengthMetres },
        },
      });
    });
  });
}
