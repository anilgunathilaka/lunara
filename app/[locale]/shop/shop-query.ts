import type { CatalogueProduct, Occasion } from '@/lib/catalogue/types';

/**
 * The shop's filters and sort as they live in the address (docs/2-ui.md
 * §7.6, docs/1-ux.md §3.1): ?category=a,b&colour=…&occasion=…&price=…
 * &stock=1&sort=…. Pure, so the server reads it for the first render and
 * the client writes it back as the customer chooses.
 */

export const OCCASIONS = ['office', 'everyday', 'festive', 'temple'] as const satisfies readonly Occasion[];
export const PRICE_BANDS = ['under8000', '8000to9000', 'over9000'] as const;
export const SORTS = ['featured', 'priceAsc', 'priceDesc'] as const;

export type PriceBand = (typeof PRICE_BANDS)[number];
export type ShopSort = (typeof SORTS)[number];

export interface ShopQuery {
  category: string[];
  colour: string[];
  occasion: Occasion[];
  price: PriceBand[];
  inStock: boolean;
  sort: ShopSort;
}

export type FilterGroup = 'category' | 'colour' | 'occasion' | 'price' | 'inStock';

export const EMPTY_QUERY: ShopQuery = { category: [], colour: [], occasion: [], price: [], inStock: false, sort: 'featured' };

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(',') : (value ?? '');
  return [
    ...new Set(
      raw
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v.length <= 100),
    ),
  ].slice(0, 20);
}

function only<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export function parseShopQuery(query: Record<string, string | string[] | undefined>): ShopQuery {
  const sort = list(query.sort)[0];
  return {
    category: list(query.category),
    colour: list(query.colour),
    occasion: only(list(query.occasion), OCCASIONS),
    price: only(list(query.price), PRICE_BANDS),
    inStock: list(query.stock)[0] === '1',
    sort: (SORTS as readonly string[]).includes(sort ?? '') ? (sort as ShopSort) : 'featured',
  };
}

export function shopQueryString(q: ShopQuery): string {
  const params = new URLSearchParams();
  if (q.category.length) params.set('category', q.category.join(','));
  if (q.colour.length) params.set('colour', q.colour.join(','));
  if (q.occasion.length) params.set('occasion', q.occasion.join(','));
  if (q.price.length) params.set('price', q.price.join(','));
  if (q.inStock) params.set('stock', '1');
  if (q.sort !== 'featured') params.set('sort', q.sort);
  const text = params.toString().replace(/%2C/g, ',');
  return text ? `?${text}` : '';
}

export function inPriceBand(price: number, band: PriceBand): boolean {
  if (band === 'under8000') return price < 8000;
  if (band === '8000to9000') return price >= 8000 && price <= 9000;
  return price > 9000;
}

/** Within a group, any chosen option matches (or); groups narrow (and). `skip` leaves one group out, for its counts. */
export function matches(p: CatalogueProduct, q: ShopQuery, skip?: FilterGroup): boolean {
  if (skip !== 'category' && q.category.length && !q.category.includes(p.categoryId)) return false;
  if (skip !== 'colour' && q.colour.length && !q.colour.includes(p.colourName)) return false;
  if (skip !== 'occasion' && q.occasion.length && !q.occasion.some((o) => p.occasions.includes(o))) return false;
  if (skip !== 'price' && q.price.length && !q.price.some((b) => inPriceBand(p.price, b))) return false;
  if (skip !== 'inStock' && q.inStock && p.stockState === 'out') return false;
  return true;
}

export function sortProducts(products: CatalogueProduct[], sort: ShopSort): CatalogueProduct[] {
  if (sort === 'featured') return products;
  const sorted = [...products];
  sorted.sort((a, b) => (sort === 'priceAsc' ? a.price - b.price : b.price - a.price));
  return sorted;
}

export function activeCount(q: ShopQuery): number {
  return q.category.length + q.colour.length + q.occasion.length + q.price.length + (q.inStock ? 1 : 0);
}
