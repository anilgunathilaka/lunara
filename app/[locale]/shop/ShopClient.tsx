'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/primitives/Button';
import { ProductCard } from '@/components/product/ProductCard';
import type { CatalogueProduct, Occasion, SareeCategory } from '@/lib/catalogue/types';

type PriceBand = 'all' | 'under8000' | '8000to9000' | 'over9000';
type OccasionFilter = 'all' | Occasion;

export interface ShopClientProps {
  products: CatalogueProduct[];
  /** Saree categories on sale, in the admin's order (PRD v4.0). */
  categories: SareeCategory[];
  /** From /shop?category=…; the customer can still change it. */
  initialCategory?: string;
  filterLabels: { category: string; occasion: string; priceBand: string; all: string; clear: string };
  occasionLabels: Record<Occasion, string>;
  priceBandLabels: Record<Exclude<PriceBand, 'all'>, string>;
  noResultsLabel: string;
  noResultsActionLabel: string;
  outOfStockLabel: string;
  lowStockLabel: string;
}

function matchesPriceBand(price: number, band: PriceBand): boolean {
  if (band === 'all') return true;
  if (band === 'under8000') return price < 8000;
  if (band === '8000to9000') return price >= 8000 && price <= 9000;
  return price > 9000;
}

export function ShopClient({
  products,
  categories,
  initialCategory = 'all',
  filterLabels,
  occasionLabels,
  priceBandLabels,
  noResultsLabel,
  noResultsActionLabel,
  outOfStockLabel,
  lowStockLabel,
}: ShopClientProps) {
  const t = useTranslations('shop');
  const tStock = useTranslations('product.stock');
  const formatLeft = (count: number) => tStock('left', { count });
  const [category, setCategory] = useState<string>(initialCategory);
  const [occasion, setOccasion] = useState<OccasionFilter>('all');
  const [priceBand, setPriceBand] = useState<PriceBand>('all');

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === 'all' || p.categoryId === category) &&
          (occasion === 'all' || p.occasions.includes(occasion)) &&
          matchesPriceBand(p.price, priceBand),
      ),
    [products, category, occasion, priceBand],
  );

  const hasActiveFilters = category !== 'all' || occasion !== 'all' || priceBand !== 'all';

  function clearFilters() {
    setCategory('all');
    setOccasion('all');
    setPriceBand('all');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="field">
          <span className="field-label">{filterLabels.category}</span>
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all', name: filterLabels.all }, ...categories].map((value) => (
              <button
                key={value.id}
                type="button"
                onClick={() => setCategory(value.id)}
                className={`material-option ${category === value.id ? 'material-option-active' : ''}`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">{filterLabels.occasion}</span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'office', 'everyday', 'festive', 'temple'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setOccasion(value)}
                className={`material-option ${occasion === value ? 'material-option-active' : ''}`}
              >
                {value === 'all' ? filterLabels.all : occasionLabels[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">{filterLabels.priceBand}</span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'under8000', '8000to9000', 'over9000'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriceBand(value)}
                className={`material-option ${priceBand === value ? 'material-option-active' : ''}`}
              >
                {value === 'all' ? filterLabels.all : priceBandLabels[value]}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="tertiary" size="sm" onClick={clearFilters}>
            {filterLabels.clear}
          </Button>
        )}
      </div>

      <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
        {t('resultsCount', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-message">{noResultsLabel}</p>
          <div className="empty-state-actions">
            <Button variant="secondary" onClick={clearFilters}>
              {noResultsActionLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="home-arrivals-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              href={`/shop/${product.id}`}
              image={{ src: product.imageUrl, alt: product.name }}
              name={product.name}
              code={product.productCode}
              materialLabel={product.categoryName}
              price={product.price}
              jacketMaterialName={product.jacketMaterialName}
              jacketSwatchHex={product.jacketSwatchHex}
              stockState={product.stockState}
              quantity={product.quantity}
              outOfStockLabel={outOfStockLabel}
              lowStockLabel={lowStockLabel}
              formatLeft={formatLeft}
            />
          ))}
        </div>
      )}
    </div>
  );
}
