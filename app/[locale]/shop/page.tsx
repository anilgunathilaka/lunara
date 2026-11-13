import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { getCuratedListings, getSareeCategories } from '@/lib/catalogue/queries';
import { categoryNamer } from '@/lib/catalogue/category-label';
import { ShopClient } from './ShopClient';

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  // /shop?category=… opens with that saree category chosen (the home page tiles link here).
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('shop');
  const tStock = await getTranslations('product.stock');
  const [listed, sareeCategories, categoryName] = await Promise.all([getCuratedListings(), getSareeCategories(), categoryNamer()]);
  // Category names in the page's language.
  const categories = sareeCategories.map((c) => ({ ...c, name: categoryName(c.id, c.name) }));
  const products = listed.map((p) => ({ ...p, categoryName: categoryName(p.categoryId, p.categoryName) }));
  const initialCategory = categories.some((c) => c.id === category) ? category! : 'all';

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
          categories={categories}
          initialCategory={initialCategory}
          filterLabels={{
            category: t('filters.category'),
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
