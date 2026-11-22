import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCuratedListings, getSareeCategories } from '@/lib/catalogue/queries';
import { categoryNamer } from '@/lib/catalogue/category-label';
import { ShopClient } from './ShopClient';
import { parseShopQuery } from './shop-query';

/**
 * The shop (docs/2-ui.md §7.6; founder decision 2026-11-22, after
 * perniaspopupshop.com): breadcrumb, a heading row with the count and Sort
 * by, filters in a column beside the grid. Filters and sort live in the
 * address, so a filtered page can be shared (docs/1-ux.md §3.1).
 */
export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('shop');
  const tPdp = await getTranslations('pdp');
  const tStock = await getTranslations('product.stock');
  const [listed, sareeCategories, categoryName] = await Promise.all([getCuratedListings(), getSareeCategories(), categoryNamer()]);
  // Category names in the page's language.
  const categories = sareeCategories.map((c) => ({ ...c, name: categoryName(c.id, c.name) }));
  // The jacket is never named to the customer (PRD v4.1), so it is not sent to the browser either.
  const products = listed.map((p) => ({
    ...p,
    categoryName: categoryName(p.categoryId, p.categoryName),
    jacketMaterialName: '',
    jacketColourName: '',
    jacketSwatchHex: '',
    jacketSwatchUrl: null,
  }));

  return (
    <div className="home-section shop">
      <div className="home-section-inner">
        <nav aria-label={tPdp('breadcrumb')}>
          <ol className="pdp-breadcrumb">
            <li>
              <Link href="/">{tPdp('home')}</Link>
            </li>
            <li aria-current="page">{t('breadcrumb')}</li>
          </ol>
        </nav>

        <ShopClient
          title={t('title')}
          products={products}
          categories={categories}
          initial={parseShopQuery(query)}
          outOfStockLabel={tStock('outOfStock')}
          lowStockLabel={tStock('lowStock')}
        />
      </div>
    </div>
  );
}
