'use server';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCustomer } from '@/lib/account/customer';
import { getPrisma } from '@/lib/prisma';

const nameSchema = z.object({
  locale: z.enum(['en', 'si', 'ta']).catch('en'),
  name: z.string().trim().min(1).max(80),
});

/** The customer changes the name on their profile (founder decision 2026-11-24). */
export async function updateProfileNameAction(form: FormData): Promise<void> {
  const parsed = nameSchema.safeParse(Object.fromEntries(form));
  const locale = parsed.success ? parsed.data.locale : 'en';
  const customer = await getCustomer();
  if (!customer) redirect(`/${locale}/sign-in` as Route);
  if (!parsed.success) redirect(`/${locale}/account?profile=invalid` as Route);
  await getPrisma().user.update({ where: { id: customer.id }, data: { name: parsed.data.name } });
  revalidatePath(`/${locale}/account`);
  redirect(`/${locale}/account?profile=saved` as Route);
}
