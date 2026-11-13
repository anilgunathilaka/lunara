import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { isDistrictId } from '@/lib/commerce/delivery';
import { formatDate } from '@/lib/format/date';
import { getInsights, percent } from '@/lib/ops/insights';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import type { OpsSearchParams } from '../shared';

const PERIODS = ['30', '90', '365', 'all'] as const;
type Period = (typeof PERIODS)[number];

/**
 * PRD §8 success metrics for staff (docs/4-architecture.md §3.9). Each
 * figure shows its raw counts beside the share, so a small sample is never
 * mistaken for a trend.
 */
export default async function OpsInsightsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/insights`);
  const query = await searchParams;
  const period: Period = PERIODS.includes(query.period as Period) ? (query.period as Period) : '90';
  const [data, t, tDistricts] = await Promise.all([
    getInsights(period === 'all' ? null : Number(period)),
    getTranslations('ops.insights'),
    getTranslations('districts'),
  ]);

  const share = (part: number, whole: number) => {
    const p = percent(part, whole);
    return p === null ? t('noData') : t('share', { percent: p, part, whole });
  };
  const district = (id: string) => (isDistrictId(id) ? tDistricts(id) : id);

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '880px' }}>
      <p className="field-message" style={{ maxWidth: '68ch' }}>
        {t('intro')}
      </p>

      <nav className="ops-nav" aria-label={t('periodLabel')}>
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={{ pathname: '/ops/insights', query: { period: p } }}
            className="ops-nav-link focus-ring"
            aria-current={p === period ? 'page' : undefined}
          >
            {t(`period.${p}`)}
          </Link>
        ))}
      </nav>
      {data.since && <p className="field-message">{t('since', { date: formatDate(data.since, locale) })}</p>}

      <section className="flex flex-col gap-3" aria-labelledby="north-star">
        <h2 id="north-star" className="checkout-step-title">
          {t('northStar')}
        </h2>
        <dl className="spec-list">
          {data.repeat.map((row) => (
            <div key={row.months} className="spec-row">
              <dt className="spec-row-term">{t('repeatAt', { months: row.months })}</dt>
              <dd>{row.eligible === 0 ? t('repeatTooEarly', { months: row.months }) : share(row.repeated, row.eligible)}</dd>
            </div>
          ))}
        </dl>
        <p className="field-message">{t('repeatNote')}</p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="sales">
        <h2 id="sales" className="checkout-step-title">
          {t('salesHeading')}
        </h2>
        <dl className="spec-list">
          <Row term={t('ordersPlaced')} value={String(data.orders.placed)} />
          <Row term={t('cancelled')} value={share(data.orders.cancelled, data.orders.placed)} />
          <Row term={t('delivered')} value={String(data.orders.delivered)} />
          <Row term={t('deliveredRevenue')} value={formatPriceLKR(data.deliveredRevenue)} note={t('deliveredRevenueNote')} />
          <Row term={t('codShare')} value={share(data.orders.cod, data.orders.placed)} />
          <Row term={t('bankShare')} value={share(data.orders.bankTransfer, data.orders.placed)} />
        </dl>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="product">
        <h2 id="product" className="checkout-step-title">
          {t('productHeading')}
        </h2>
        <dl className="spec-list">
          <Row
            term={t('jacketAttachment')}
            value={share(data.jacketAttachment.ordersWithJacket, data.jacketAttachment.orders)}
            note={t('jacketAttachmentNote', { units: data.jacketAttachment.jacketUnits })}
          />
          <Row term={t('osariya')} value={share(data.osariya.osariyaUnits, data.osariya.configuredUnits)} note={t('osariyaNote')} />
        </dl>
        <h3 className="field-label">{t('categoriesHeading')}</h3>
        {data.categories.length === 0 ? (
          <p className="field-message">{t('noData')}</p>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('category')}</th>
                <th scope="col">{t('units')}</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3 className="field-label">{t('designsHeading')}</h3>
        {data.designs.length === 0 ? (
          <p className="field-message">{t('noData')}</p>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('design')}</th>
                <th scope="col">{t('units')}</th>
              </tr>
            </thead>
            <tbody>
              {data.designs.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="quality">
        <h2 id="quality" className="checkout-step-title">
          {t('qualityHeading')}
        </h2>
        <dl className="spec-list">
          <Row term={t('onTimeDispatch')} value={share(data.dispatch.onTime, data.dispatch.dispatched)} note={t('onTimeDispatchNote')} />
          <Row
            term={t('photoReviews')}
            value={
              data.reviews.deliveredOrders === 0
                ? t('noData')
                : t('per100', { value: Math.round((data.reviews.withPhotos / data.reviews.deliveredOrders) * 1000) / 10 })
            }
            note={t('photoReviewsNote', { reviews: data.reviews.reviews, withPhotos: data.reviews.withPhotos, delivered: data.reviews.deliveredOrders })}
          />
          <Row term={t('averageRating')} value={data.reviews.average === null ? t('noData') : t('outOf5', { value: data.reviews.average })} />
        </dl>
        <h3 className="field-label">{t('returnsHeading')}</h3>
        {data.returnsByColourway.length === 0 ? (
          <p className="field-message">{t('noData')}</p>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('colourway')}</th>
                <th scope="col">{t('deliveredOrders')}</th>
                <th scope="col">{t('returned')}</th>
              </tr>
            </thead>
            <tbody>
              {data.returnsByColourway.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.delivered}</td>
                  <td>{share(row.returned, row.delivered)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="field-message">{t('returnsNote')}</p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="cod">
        <h2 id="cod" className="checkout-step-title">
          {t('codHeading')}
        </h2>
        {data.codByDistrict.length === 0 ? (
          <p className="field-message">{t('noData')}</p>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th scope="col">{t('district')}</th>
                <th scope="col">{t('codOrders')}</th>
                <th scope="col">{t('delivered')}</th>
                <th scope="col">{t('cancelled')}</th>
              </tr>
            </thead>
            <tbody>
              {data.codByDistrict.map((row) => (
                <tr key={row.district}>
                  <td>{district(row.district)}</td>
                  <td>{row.orders}</td>
                  <td>{row.delivered}</td>
                  <td>{share(row.cancelled, row.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="field-message">{t('codNote')}</p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="not-yet">
        <h2 id="not-yet" className="checkout-step-title">
          {t('notYetHeading')}
        </h2>
        <ul className="flex flex-col gap-2">
          {(['configurator', 'colourComplaints', 'codRefusal', 'whatsapp', 'costPerOrder'] as const).map((key) => (
            <li key={key} className="field-message">
              <strong>{t(`notYet.${key}.metric`)}</strong> — {t(`notYet.${key}.why`)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({ term, value, note }: { term: string; value: string; note?: string }) {
  return (
    <div className="spec-row">
      <dt className="spec-row-term">
        {term}
        {note && <span className="insight-note">{note}</span>}
      </dt>
      <dd>
        <strong>{value}</strong>
      </dd>
    </div>
  );
}
