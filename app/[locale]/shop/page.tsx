import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { getCuratedListings } from '@/lib/catalogue/queries';
import { ShopClient } from './ShopClient';

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('shop');
  const tFabric = await getTranslations('product.fabric');
  const tStock = await getTranslations('product.stock');
  const products = await getCuratedListings();

  return (
    <div className="home-section">
      <div className="home-section-inner">
        <div className="home-section-header">
          <div>
            <SectionMarker />
            <h1 className="home-section-title">{t('title')}</h1>
          </div>
        </div>

        <ShopClient
          products={products}
          materialLabels={{ plain: tFabric('materialPlain'), super: tFabric('materialSuper') }}
          filterLabels={{
            material: t('filters.material'),
            occasion: t('filters.occasion'),
            priceBand: t('filters.priceBand'),
            all: t('filters.all'),
            clear: t('filters.clear'),
          }}
          occasionLabels={{
            office: t('occasion.office'),
            everyday: t('occasion.everyday'),
            festive: t('occasion.festive'),
            temple: t('occasion.temple'),
          }}
          priceBandLabels={{
            under8000: t('priceBand.under8000'),
            '8000to9000': t('priceBand.8000to9000'),
            over9000: t('priceBand.over9000'),
          }}
          noResultsLabel={t('noResults')}
          noResultsActionLabel={t('noResultsAction')}
          outOfStockLabel={tStock('outOfStock')}
          lowStockLabel={tStock('lowStock')}
        />
      </div>
    </div>
  );
}
