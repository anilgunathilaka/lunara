'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox';
import { SlideOver } from '@/components/layout/SlideOver';
import { ProductCard } from '@/components/product/ProductCard';
import type { CatalogueProduct, SareeCategory } from '@/lib/catalogue/types';
import { FEATURES } from '@/lib/features';
import {
  EMPTY_QUERY,
  OCCASIONS,
  PRICE_BANDS,
  SORTS,
  activeCount,
  inPriceBand,
  matches,
  shopQueryString,
  sortProducts,
  type FilterGroup,
  type ShopQuery,
  type ShopSort,
} from './shop-query';

/** Cards added each time the customer reaches the end of the grid (docs/2-ui.md §7.6). */
const PAGE_SIZE = 24;
const CARD_SIZES = '(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 50vw';

export interface ShopClientProps {
  title: string;
  products: CatalogueProduct[];
  /** Saree categories on sale, in the admin's order (PRD v4.0), names in the page's language. */
  categories: SareeCategory[];
  /** Filters and sort read from the address on the server. */
  initial: ShopQuery;
  outOfStockLabel: string;
  lowStockLabel: string;
}

type ListKey = 'category' | 'colour' | 'occasion' | 'price';

interface Option {
  value: string;
  label: string;
  count: number;
  swatch?: string;
}

export function ShopClient({ title, products, categories, initial, outOfStockLabel, lowStockLabel }: ShopClientProps) {
  const t = useTranslations('shop');
  const tStock = useTranslations('product.stock');
  const tLayout = useTranslations('layout.slideover');
  const formatLeft = (count: number) => tStock('left', { count });
  const pathname = usePathname();

  // Category ids that no longer exist are dropped, not kept as invisible filters.
  // With the filters switched off, only the sort is taken from the address.
  const [query, setQuery] = useState<ShopQuery>(() =>
    FEATURES.shopFilters
      ? { ...initial, category: initial.category.filter((id) => categories.some((c) => c.id === id)) }
      : { ...EMPTY_QUERY, sort: initial.sort },
  );
  const [shown, setShown] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Every choice is written into the address without a reload (docs/1-ux.md §3.1).
  useEffect(() => {
    const next = `${pathname}${shopQueryString(query)}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(window.history.state, '', next);
    }
  }, [query, pathname]);

  const update = useCallback((change: (q: ShopQuery) => ShopQuery) => {
    setQuery((q) => change(q));
    setShown(PAGE_SIZE);
  }, []);

  function toggle(key: ListKey, value: string) {
    update((q) => {
      const current = q[key] as string[];
      const nextValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...q, [key]: nextValues };
    });
  }

  const clearAll = () => update((q) => ({ ...EMPTY_QUERY, sort: q.sort }));

  const results = useMemo(
    () =>
      sortProducts(
        products.filter((p) => matches(p, query)),
        query.sort,
      ),
    [products, query],
  );

  // Each option's count, with every other group applied (§7.6).
  const groups = useMemo(() => {
    const countWithout = (group: FilterGroup, test: (p: CatalogueProduct) => boolean) =>
      products.filter((p) => matches(p, query, group) && test(p)).length;

    const colours = new Map<string, string>();
    for (const p of products) if (!colours.has(p.colourName)) colours.set(p.colourName, p.colourHex);

    const out: { key: ListKey; label: string; options: Option[] }[] = [
      {
        key: 'category',
        label: t('filters.category'),
        options: categories.map((c) => ({
          value: c.id,
          label: c.name,
          count: countWithout('category', (p) => p.categoryId === c.id),
        })),
      },
      {
        key: 'colour',
        label: t('filters.colour'),
        options: [...colours]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, hex]) => ({
            value: name,
            label: name,
            swatch: hex,
            count: countWithout('colour', (p) => p.colourName === name),
          })),
      },
      {
        key: 'occasion',
        label: t('filters.occasion'),
        options: OCCASIONS.map((o) => ({
          value: o,
          label: t(`occasion.${o}`),
          count: countWithout('occasion', (p) => p.occasions.includes(o)),
        })),
      },
      {
        key: 'price',
        label: t('filters.priceBand'),
        options: PRICE_BANDS.map((b) => ({
          value: b,
          label: t(`priceBand.${b}`),
          count: countWithout('price', (p) => inPriceBand(p.price, b)),
        })),
      },
    ];
    const inStockCount = countWithout('inStock', (p) => p.stockState !== 'out');
    return { lists: out.filter((g) => g.options.length > 0), inStockCount };
  }, [products, categories, query, t]);

  // Infinite scroll: more cards as the end of the grid comes into view.
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = shown < results.length;
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown((n) => n + PAGE_SIZE);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, shown]);

  const chosen = activeCount(query);

  const filters = (idPrefix: string) => (
    <div className="shop-filters">
      {chosen > 0 && (
        <button type="button" className="shop-filters-clear" onClick={clearAll}>
          {t('filters.clearAll')}
        </button>
      )}
      <Checkbox
        id={`${idPrefix}-stock`}
        checked={query.inStock}
        onChange={() => update((q) => ({ ...q, inStock: !q.inStock }))}
        label={
          <span className="shop-filter-option">
            {t('filters.inStock')} <span className="shop-filter-count">({groups.inStockCount})</span>
          </span>
        }
      />
      {groups.lists.map((group) => (
        <fieldset key={group.key} className="shop-filter-group">
          <legend className="shop-filter-heading">{group.label}</legend>
          <div className="shop-filter-list">
            {group.options.map((option) => (
              <Checkbox
                key={option.value}
                id={`${idPrefix}-${group.key}-${option.value}`}
                checked={(query[group.key] as string[]).includes(option.value)}
                onChange={() => toggle(group.key, option.value)}
                label={
                  <span className="shop-filter-option">
                    {option.swatch && (
                      <span className="shop-filter-swatch" style={{ backgroundColor: option.swatch }} aria-hidden="true" />
                    )}
                    {option.label} <span className="shop-filter-count">({option.count})</span>
                  </span>
                }
              />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );

  const sortControl = (id: string) => (
    <label className="shop-sort" htmlFor={id}>
      <span className="shop-sort-label">{t('sort.label')}</span>
      <select
        id={id}
        className="shop-sort-select"
        value={query.sort}
        onChange={(event) => update((q) => ({ ...q, sort: event.target.value as ShopSort }))}
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {t(`sort.${s}`)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className={FEATURES.shopFilters ? 'shop-layout' : 'shop-layout shop-layout-plain'}>
      {FEATURES.shopFilters && (
        <aside className="shop-sidebar" aria-label={t('filters.heading')}>
          {filters('side')}
        </aside>
      )}

      <div className="shop-main">
        <div className="shop-head">
          <h1 className="shop-title">
            {title} <span className="shop-count">({t('resultsCount', { count: results.length })})</span>
          </h1>
          <div className="shop-head-sort">{sortControl('shop-sort')}</div>
        </div>

        <div className="shop-toolbar">
          {FEATURES.shopFilters && (
            <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              {chosen > 0 ? `${t('filters.button')} (${chosen})` : t('filters.button')}
            </Button>
          )}
          {sortControl('shop-sort-mobile')}
        </div>

        <p className="sr-only" aria-live="polite">
          {t('resultsCount', { count: results.length })}
        </p>

        {results.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">{t('noResults')}</p>
            <div className="empty-state-actions">
              <Button variant="secondary" onClick={clearAll}>
                {t('noResultsAction')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="shop-grid">
            {results.slice(0, shown).map((product) => (
              <ProductCard
                key={product.id}
                href={`/shop/${product.id}`}
                image={{ src: product.imageUrl, alt: product.name }}
                hoverImageSrc={product.gallery[1] ?? null}
                badgeOnImage
                sizes={CARD_SIZES}
                name={product.name}
                code={product.productCode}
                materialLabel={product.categoryName}
                price={product.price}
                stockState={product.stockState}
                quantity={product.quantity}
                outOfStockLabel={outOfStockLabel}
                lowStockLabel={lowStockLabel}
                formatLeft={formatLeft}
              />
            ))}
          </div>
        )}
        {hasMore && <div ref={sentinel} className="shop-sentinel" aria-hidden="true" />}
      </div>

      <SlideOver
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t('filters.heading')}
        closeLabel={tLayout('close')}
      >
        {filters('drawer')}
        <div className="shop-drawer-actions">
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            {t('filters.show', { count: results.length })}
          </Button>
        </div>
      </SlideOver>
    </div>
  );
}
