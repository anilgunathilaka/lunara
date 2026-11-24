'use server';

import { z } from 'zod';
import { getCustomer } from '@/lib/account/customer';
import { getPrisma } from '@/lib/prisma';
import { getCuratedListingsByIds } from '@/lib/catalogue/queries';
import type { CatalogueProduct } from '@/lib/catalogue/types';

/**
 * Favourites on the server (founder decision 2026-11-24). The browser keeps
 * the list for everyone; these copy it to a signed-in customer's account.
 * Anything not signed in is ignored, never an error.
 */

const listingId = z.string().min(1).max(100);
const listingIds = z.array(listingId).max(200);

/** On sign-in: add the browser's favourites to the account, then return the account's full list. */
export async function syncFavouritesAction(localIds: string[]): Promise<string[] | null> {
  const customer = await getCustomer();
  if (!customer) return null;
  const ids = listingIds.safeParse(localIds);
  if (!ids.success) return null;
  const prisma = getPrisma();
  if (ids.data.length > 0) {
    // Only sarees that exist; unknown ids are dropped quietly.
    const known = await prisma.curatedListing.findMany({ where: { id: { in: ids.data } }, select: { id: true } });
    if (known.length > 0) {
      await prisma.favourite.createMany({ data: known.map((l) => ({ userId: customer.id, listingId: l.id })), skipDuplicates: true });
    }
  }
  const rows = await prisma.favourite.findMany({ where: { userId: customer.id }, orderBy: { createdAt: 'desc' }, select: { listingId: true }, take: 200 });
  return rows.map((r) => r.listingId);
}

/** One heart tapped while signed in. */
export async function setFavouriteAction(id: string, on: boolean): Promise<void> {
  const customer = await getCustomer();
  if (!customer) return;
  const parsed = listingId.safeParse(id);
  if (!parsed.success) return;
  const prisma = getPrisma();
  const key = { userId: customer.id, listingId: parsed.data };
  if (on) {
    const exists = await prisma.curatedListing.findUnique({ where: { id: parsed.data }, select: { id: true } });
    if (exists) await prisma.favourite.upsert({ where: { userId_listingId: key }, create: key, update: {} });
  } else {
    await prisma.favourite.deleteMany({ where: key });
  }
}

/** The saree cards for a list of favourites (the favourites page, for guests too). Sarees no longer on sale drop out. */
export async function favouriteProductsAction(ids: string[]): Promise<CatalogueProduct[]> {
  const parsed = listingIds.safeParse(ids);
  if (!parsed.success || parsed.data.length === 0) return [];
  return getCuratedListingsByIds(parsed.data);
}
