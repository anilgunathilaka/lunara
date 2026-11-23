'use server';

import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import { SETTING_KEYS } from '@/lib/site/settings';
import { back, checkbox, langOf, opsLocale, run } from './flow';
import { requireStaffAction } from './staff';

const topSellSchema = z.object({ locale: opsLocale, visible: checkbox });

/** Show or hide the whole Top sell section on the home page (founder decision 2026-11-23). Audited. */
export async function homeTopSellAction(form: FormData): Promise<void> {
  const staff = await requireStaffAction();
  const lang = langOf(form);
  const path = `/${lang}/ops/products`;
  const parsed = topSellSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: 'invalid' });
  const { visible } = parsed.data;

  await run(path, async () => {
    await getPrisma().$transaction(async (tx) => {
      const key = SETTING_KEYS.homeTopSellVisible;
      const current = await tx.siteSetting.findUnique({ where: { key } });
      await tx.siteSetting.upsert({
        where: { key },
        create: { key, value: visible, updatedBy: staff.email },
        update: { value: visible, updatedBy: staff.email },
      });
      await tx.auditLog.create({
        data: { actor: staff.email, action: 'home.topSell', entityType: 'site_setting', entityId: key, before: { visible: current ? current.value !== false : true }, after: { visible } },
      });
    });
  }, 'homeSectionUpdated');
}
