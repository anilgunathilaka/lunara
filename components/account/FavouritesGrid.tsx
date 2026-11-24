'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { favouriteProductsAction } from '@/lib/favourites/actions';
import { useFavourites } from '@/lib/favourites/store';
import type { CatalogueProduct } from '@/lib/catalogue/types';

/**
 * The hearted sarees as cards (founder decision 2026-11-24), on the profile
 * and on the favourites page. Reads the same list the hearts write, so a
 * saree un-hearted here leaves at once. Prices and stock come from the
 * server, never from the browser's copy.
 */
export function FavouritesGrid() {
  const t = useTranslations('favourites');
  const tStock = useTranslations('product.stock');
  const { ids } = useFavourites();
  const [products, setProducts] = useState<CatalogueProduct[] | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    // Nothing hearted: nothing to fetch (the empty state shows below).
    if (key === '') return;
    let live = true;
    favouriteProductsAction(key.split(','))
      .then((list) => {
        if (live) setProducts(list);
      })
      .catch(() => {
        if (live) setProducts([]);
      });
    return () => {
      live = false;
    };
  }, [key]);

  if (key !== '' && products === null) return <p className="field-message">{t('loading')}</p>;
  const shown = key === '' ? [] : (products ?? []).filter((p) => ids.includes(p.id));
  if (shown.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="field-message">{t('empty')}</p>
        <Link href="/shop" className="text-link">
          {t('browse')}
        </Link>
      </div>
    );
  }
  return (
    <div className="favourites-grid">
      {shown.map((p) => (
        <ProductCard
          key={p.id}
          favouriteId={p.id}
          href={`/shop/${p.id}`}
          image={{ src: p.imageUrl, alt: p.name }}
          name={p.name}
          code={p.productCode}
          materialLabel={p.categoryName}
          price={p.price}
          stockState={p.stockState}
          quantity={p.quantity}
          outOfStockLabel={tStock('outOfStock')}
          lowStockLabel={tStock('lowStock')}
          formatLeft={(count) => tStock('left', { count })}
          sizes="(min-width: 768px) 25vw, 50vw"
        />
      ))}
    </div>
  );
}
