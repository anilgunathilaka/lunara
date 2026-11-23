import 'server-only';
import { getPrisma } from '@/lib/prisma';

/**
 * Site-wide switches the admin changes in /ops (founder decision 2026-11-23),
 * one row per key in site_setting. A missing row means the default.
 */
export const SETTING_KEYS = {
  /** Whether the home page shows the Top sell section. Default: shown. */
  homeTopSellVisible: 'home.topSell.visible',
} as const;

export async function getHomeTopSellVisible(): Promise<boolean> {
  const row = await getPrisma().siteSetting.findUnique({ where: { key: SETTING_KEYS.homeTopSellVisible } });
  return row ? row.value !== false : true;
}
