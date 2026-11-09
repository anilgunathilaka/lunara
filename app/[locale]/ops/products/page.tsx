import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { productAdminList } from '@/lib/ops/products';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { OpsFlash, type OpsSearchParams } from '../shared';

/** Every saree product and jacket colour, live and archived (docs/4-architecture.md §3.10). */
export default async function OpsProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/products`);
  const [data, query, t, tLevel] = await Promise.all([
    productAdminList(),
    searchParams,
    getTranslations('ops.products'),
    getTranslations('product.stock'),
  ]);
  const level = (state: string) => (state === 'out' ? ` · ${tLevel('outOfStock')}` : state === 'low' ? ` · ${tLevel('lowStock')}` : '');

  return (
    <div className="flex flex-col gap-6">
      <OpsFlash searchParams={query} />
      <p className="field-message" style={{ maxWidth: '68ch' }}>
        {t('intro')}
      </p>

      <section className="flex flex-col gap-3" aria-labelledby="sarees">
        <div className="ops-inline-form">
          <h2 id="sarees" className="checkout-step-title">
            {t('sareesHeading', { count: data.sarees.length })}
          </h2>
          <Link href="/ops/products/new" className="btn focus-ring btn-primary btn-sm">
            {t('addSaree')}
          </Link>
        </div>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('photo')}</th>
                <th scope="col">{t('product')}</th>
                <th scope="col">{t('jacket')}</th>
                <th scope="col">{t('price')}</th>
                <th scope="col">{t('inStock')}</th>
                <th scope="col">{t('status')}</th>
                <th scope="col">
                  <span className="sr-only">{t('edit')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.sarees.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="ops-thumb">
                      {row.cover ? <Image src={row.cover} alt="" fill sizes="64px" unoptimized /> : null}
                    </span>
                  </td>
                  <td>
                    <strong>{row.name}</strong>
                    <br />
                    <span className="ops-muted">
                      <span className="ops-swatch" style={{ background: row.colourHex }} aria-hidden="true" />
                      {row.detail} · {row.sku}
                    </span>
                  </td>
                  <td>{row.jacket}</td>
                  <td>{formatPriceLKR(row.price)}</td>
                  <td className={row.state === 'out' ? 'ops-status-out' : row.state === 'low' ? 'ops-status-low' : undefined}>
                    {row.quantity}
                    {level(row.state)}
                  </td>
                  <td>{row.active ? (row.featured ? t('liveFeatured') : t('live')) : t('archived')}</td>
                  <td>
                    <Link href={`/ops/products/${row.id}`} className="btn focus-ring btn-secondary btn-sm">
                      {t('edit')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="jackets">
        <div className="ops-inline-form">
          <h2 id="jackets" className="checkout-step-title">
            {t('jacketsHeading', { count: data.jackets.length })}
          </h2>
          <Link href="/ops/products/jackets/new" className="btn focus-ring btn-primary btn-sm">
            {t('addJacket')}
          </Link>
        </div>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('product')}</th>
                <th scope="col">{t('priceAlone')}</th>
                <th scope="col">{t('pairingAddOn')}</th>
                <th scope="col">{t('inStock')}</th>
                <th scope="col">{t('status')}</th>
                <th scope="col">
                  <span className="sr-only">{t('edit')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.jackets.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="ops-swatch" style={{ background: row.colourHex }} aria-hidden="true" />
                    <strong>{row.name}</strong>
                    <br />
                    <span className="ops-muted">
                      {row.sku} · {t('usedIn', { count: row.listings })}
                    </span>
                  </td>
                  <td>{formatPriceLKR(row.price)}</td>
                  <td>{formatPriceLKR(row.pairingAddOn)}</td>
                  <td className={row.state === 'out' ? 'ops-status-out' : row.state === 'low' ? 'ops-status-low' : undefined}>
                    {row.quantity}
                    {level(row.state)}
                  </td>
                  <td>{row.active ? t('live') : t('archived')}</td>
                  <td>
                    <Link href={`/ops/products/jackets/${row.id}`} className="btn focus-ring btn-secondary btn-sm">
                      {t('edit')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
