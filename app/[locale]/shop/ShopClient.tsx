'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/primitives/Button';
import { ProductCard } from '@/components/product/ProductCard';
import type { CatalogueProduct, Occasion } from '@/lib/catalogue/types';

type PriceBand = 'all' | 'under8000' | '8000to9000' | 'over9000';
type MaterialFilter = 'all' | 'plain' | 'super';
type OccasionFilter = 'all' | Occasion;

export interface ShopClientProps {
  products: CatalogueProduct[];
  /** From /shop?material=…; the customer can still change it. */
  initialMaterial?: MaterialFilter;
  materialLabels: { plain: string; super: string };
  filterLabels: { material: string; occasion: string; priceBand: string; all: string; clear: string };
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
  initialMaterial = 'all',
  materialLabels,
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
  const [material, setMaterial] = useState<MaterialFilter>(initialMaterial);
  const [occasion, setOccasion] = useState<OccasionFilter>('all');
  const [priceBand, setPriceBand] = useState<PriceBand>('all');

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (material === 'all' || p.material === material) &&
          (occasion === 'all' || p.occasions.includes(occasion)) &&
          matchesPriceBand(p.price, priceBand),
      ),
    [products, material, occasion, priceBand],
  );

  const hasActiveFilters = material !== 'all' || occasion !== 'all' || priceBand !== 'all';

  function clearFilters() {
    setMaterial('all');
    setOccasion('all');
    setPriceBand('all');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="field">
          <span className="field-label">{filterLabels.material}</span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'plain', 'super'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMaterial(value)}
                className={`material-option ${material === value ? 'material-option-active' : ''}`}
              >
                {value === 'all' ? filterLabels.all : materialLabels[value]}
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
              materialLabel={materialLabels[product.material]}
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
