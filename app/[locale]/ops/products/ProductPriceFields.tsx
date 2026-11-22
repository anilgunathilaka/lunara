'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatPriceLKR } from '@/lib/pricing/format';

/**
 * The saree price field with what the customer will pay, worked out as staff
 * type (docs/2-ui.md §7.7): this saree's own price (PRD v4.2) + the chosen
 * jacket's price = the one total the shop shows. On the add form, choosing a
 * design and category fills in their starting price.
 *
 * It reads the form it sits in (designId, materialId, jacketColourwayId), so
 * the rest of the form stays a plain server-rendered form. Without
 * JavaScript the price field still works; only the sum is missing.
 */
export interface ProductPriceFieldsProps {
  /** Add form: "design|category" → starting price, filled in when chosen. */
  startingPrices?: Record<string, number>;
  /** Jacket colour id → its price, added to the saree's. */
  jacketAddOns: Record<string, number>;
  /** Edit form: the saree's own price. */
  defaultPrice?: number;
}

function fieldValue(form: HTMLFormElement | null, name: string): string {
  const el = form?.elements.namedItem(name);
  return el instanceof HTMLSelectElement || el instanceof HTMLInputElement ? el.value : '';
}

export function ProductPriceFields({ startingPrices, jacketAddOns, defaultPrice }: ProductPriceFieldsProps) {
  const t = useTranslations('ops.products');
  const ref = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState<string>(defaultPrice ? String(defaultPrice) : '');
  const [jacketId, setJacketId] = useState<string>('');
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const form = ref.current?.closest('form') ?? null;
    if (!form) return;
    const read = (event?: Event) => {
      setJacketId(fieldValue(form, 'jacketColourwayId'));
      const name = event?.target instanceof HTMLElement ? event.target.getAttribute('name') : null;
      if (!startingPrices || (name !== 'designId' && name !== 'materialId')) return;
      const start = startingPrices[`${fieldValue(form, 'designId')}|${fieldValue(form, 'materialId')}`];
      if (start) {
        setPrice(String(start));
        setFilled(true);
      }
    };
    read();
    form.addEventListener('change', read);
    return () => form.removeEventListener('change', read);
  }, [startingPrices]);

  const sareePrice = Number(price);
  const jacketPrice = jacketAddOns[jacketId];

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <label className="field-label" htmlFor="price">
        {t('sareePriceLabel')}
      </label>
      <input
        id="price"
        name="price"
        type="number"
        min={1}
        step={1}
        className="input ops-number-input"
        required
        value={price}
        onChange={(event) => {
          setPrice(event.target.value);
          setFilled(false);
        }}
      />
      {filled && <p className="field-message">{t('priceFilledIn')}</p>}

      <p className="ops-price-sum" aria-live="polite">
        {sareePrice > 0 && jacketPrice !== undefined
          ? t('priceSum', {
              saree: formatPriceLKR(sareePrice),
              jacket: formatPriceLKR(jacketPrice),
              total: formatPriceLKR(sareePrice + jacketPrice),
            })
          : t('priceSumPending')}
      </p>
    </div>
  );
}
