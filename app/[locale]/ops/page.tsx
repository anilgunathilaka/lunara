import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CreditCard,
  MessageSquare,
  Plus,
  Star,
  Store,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { dashboardSnapshot } from '@/lib/ops/dashboard';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatPriceLKR } from '@/lib/pricing/format';
import { formatDate } from '@/lib/format/date';
import { formatAge, formatDateTime } from './shared';
import { SalesChart } from './SalesChart';

/** "12 Nov" from YYYY-MM-DD, in the reader's language. */
function shortDay(day: string, locale: string): string {
  return new Intl.DateTimeFormat(`${locale}-LK`, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${day}T00:00:00Z`));
}

/**
 * The operations dashboard (docs/4-architecture.md §3.14): what needs someone
 * now, how the last 30 days went, the order pipeline, recent orders and what
 * is running low. Every card links to the page where the work is done.
 */
export default async function OpsDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops`);

  const [data, t, tStatus] = await Promise.all([
    dashboardSnapshot(),
    getTranslations('ops.dashboard'),
    getTranslations('commerce.orderStatus'),
  ]);

  const { sales } = data;
  const change =
    sales.previousTotal > 0 ? Math.round(((sales.total - sales.previousTotal) / sales.previousTotal) * 100) : null;
  const max = Math.max(1, ...sales.points.map((p) => p.total));

  const attention: { icon: LucideIcon; text: string; meta?: string; href: string; count: number }[] = [
    {
      icon: CreditCard,
      text: t('attention.payments', { count: data.payments.count }),
      meta:
        data.payments.count > 0 && data.payments.oldest
          ? t('attention.paymentsMeta', { amount: formatPriceLKR(data.payments.total), age: formatAge(data.payments.oldest) })
          : undefined,
      href: '/ops/payments',
      count: data.payments.count,
    },
    { icon: MessageSquare, text: t('attention.messages', { count: data.messages }), href: '/ops/messages', count: data.messages },
    { icon: AlertTriangle, text: t('attention.stockOut', { count: data.stock.out }), href: '/ops/stock', count: data.stock.out },
    { icon: Boxes, text: t('attention.stockLow', { count: data.stock.low }), href: '/ops/stock', count: data.stock.low },
    {
      icon: Store,
      text: t('attention.office', { count: data.office.overdueSales }),
      href: '/ops/office?show=overdue',
      count: data.office.overdueSales,
    },
    { icon: Star, text: t('attention.reviews', { count: data.reviewsWeek }), href: '/ops/reviews', count: data.reviewsWeek },
  ];

  return (
    <div className="ops-dashboard">
      <div className="ops-page-head">
        <div>
          <h1 className="ops-page-title">{t('title')}</h1>
          <p className="ops-page-sub">{t('today', { date: formatDate(new Date(), locale) })}</p>
        </div>
        <div className="ops-page-actions">
          <Link href="/ops/office/new" className="btn btn-primary btn-sm focus-ring">
            <Plus className="icon icon-inline" aria-hidden="true" />
            {t('newOfficeSale')}
          </Link>
          <Link href="/ops/products/new" className="btn btn-secondary btn-sm focus-ring">
            <Plus className="icon icon-inline" aria-hidden="true" />
            {t('newProduct')}
          </Link>
        </div>
      </div>

      {/* The headline figures. */}
      <ul className="ops-kpis">
        <li className="ops-card ops-kpi">
          <p className="ops-kpi-label">{t('kpi.sales')}</p>
          <p className="ops-kpi-value">{formatPriceLKR(sales.total)}</p>
          <p className="ops-kpi-meta">
            {change === null ? (
              t('kpi.noPrevious')
            ) : change > 0 ? (
              <>
                <TrendingUp className="icon icon-inline" aria-hidden="true" />
                {t('kpi.up', { percent: change })}
              </>
            ) : change < 0 ? (
              <>
                <TrendingDown className="icon icon-inline" aria-hidden="true" />
                {t('kpi.down', { percent: -change })}
              </>
            ) : (
              t('kpi.flat')
            )}
          </p>
        </li>
        <li className="ops-card ops-kpi">
          <p className="ops-kpi-label">{t('kpi.orders')}</p>
          <p className="ops-kpi-value">{sales.orders}</p>
          <p className="ops-kpi-meta">{t('kpi.average', { amount: formatPriceLKR(sales.average) })}</p>
        </li>
        <li className="ops-card ops-kpi ops-kpi-accent">
          <p className="ops-kpi-label">{t('kpi.action')}</p>
          <p className="ops-kpi-value">{data.actionTotal}</p>
          <Link href="/ops/orders" className="ops-kpi-link focus-ring">
            {t('kpi.seeOrders')}
            <ArrowRight className="icon icon-inline" aria-hidden="true" />
          </Link>
        </li>
        <li className="ops-card ops-kpi">
          <p className="ops-kpi-label">{t('kpi.officeDue')}</p>
          <p className="ops-kpi-value">{formatPriceLKR(data.office.outstanding)}</p>
          <p className="ops-kpi-meta">
            {data.office.overdue > 0 ? t('kpi.officeOverdue', { amount: formatPriceLKR(data.office.overdue) }) : t('kpi.officeNoneOverdue')}
          </p>
        </li>
      </ul>

      <div className="ops-grid">
        {/* Sales chart. */}
        <section className="ops-card ops-grid-wide" aria-labelledby="ops-sales-heading">
          <div className="ops-card-head">
            <h2 id="ops-sales-heading" className="ops-card-title">
              {t('chart.heading')}
            </h2>
            <p className="ops-card-sub">
              {t('chart.today', { amount: formatPriceLKR(sales.today.total), count: sales.today.orders })}
            </p>
          </div>
          {sales.total === 0 && <p className="ops-empty">{t('chart.empty')}</p>}
          <SalesChart
            points={sales.points.map((p) => {
              const label = shortDay(p.day, locale);
              const amount = formatPriceLKR(p.total);
              return { label, total: p.total, amount, orders: p.orders, text: t('chart.point', { day: label, amount, count: p.orders }) };
            })}
            caption={t('chart.caption')}
            columns={{ day: t('chart.day'), total: t('chart.total'), orders: t('chart.orders') }}
            scale={{ half: formatPriceLKR(Math.round(max / 2)), max: formatPriceLKR(max) }}
          />
        </section>

        {/* What is waiting for someone. */}
        <section className="ops-card" aria-labelledby="ops-attention-heading">
          <div className="ops-card-head">
            <h2 id="ops-attention-heading" className="ops-card-title">
              {t('attention.heading')}
            </h2>
          </div>
          <ul className="ops-attention">
            {attention.map(({ icon: ItemIcon, text, meta, href, count }) => (
              <li key={text}>
                <Link href={href} className="ops-attention-row focus-ring" data-waiting={count > 0 || undefined}>
                  <span className="ops-attention-icon">
                    <ItemIcon className="icon" aria-hidden="true" />
                  </span>
                  <span className="ops-attention-text">
                    {text}
                    {meta && <small>{meta}</small>}
                  </span>
                  <ArrowRight className="icon icon-inline ops-attention-go" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Order pipeline. */}
        <section className="ops-card ops-grid-wide" aria-labelledby="ops-pipeline-heading">
          <div className="ops-card-head">
            <h2 id="ops-pipeline-heading" className="ops-card-title">
              {t('pipeline.heading')}
            </h2>
          </div>
          <ol className="ops-pipeline">
            {data.needsAction.map(({ status, count }) => (
              <li key={status}>
                <Link href={{ pathname: '/ops/orders', query: { status } }} className="ops-pipeline-step focus-ring">
                  <span className="ops-pipeline-count">{count}</span>
                  <span className="ops-pipeline-label">{tStatus(status)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Running low. */}
        <section className="ops-card" aria-labelledby="ops-low-heading">
          <div className="ops-card-head">
            <h2 id="ops-low-heading" className="ops-card-title">
              {t('lowStock.heading')}
            </h2>
            <Link href="/ops/stock" className="ops-card-link focus-ring">
              {t('lowStock.manage')}
            </Link>
          </div>
          {data.stock.items.length === 0 ? (
            <p className="ops-empty">{t('lowStock.empty')}</p>
          ) : (
            <ul className="ops-list">
              {data.stock.items.map((item) => (
                <li key={item.sku}>
                  <Link href={`/ops/stock/${item.sku}`} className="ops-list-row focus-ring">
                    <span className="ops-list-main">
                      {item.name}
                      <small>{item.sku}</small>
                    </span>
                    <span className={item.state === 'out' ? 'ops-pill ops-pill-out' : 'ops-pill ops-pill-low'}>
                      {item.state === 'out' ? t('lowStock.out') : t('lowStock.left', { count: item.quantity })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent orders. */}
        <section className="ops-card ops-grid-full" aria-labelledby="ops-recent-heading">
          <div className="ops-card-head">
            <h2 id="ops-recent-heading" className="ops-card-title">
              {t('recent.heading')}
            </h2>
            <Link href="/ops/orders" className="ops-card-link focus-ring">
              {t('recent.viewAll')}
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="ops-empty">{t('recent.empty')}</p>
          ) : (
            <ul className="ops-list">
              {data.recentOrders.map((order) => (
                <li key={order.number}>
                  <Link href={`/ops/orders/${order.number}`} className="ops-list-row focus-ring">
                    <span className="ops-list-main">
                      {order.customerName}
                      <small>
                        {order.number} · {formatDateTime(order.createdAt, locale)}
                      </small>
                    </span>
                    <span className="ops-pill">{tStatus(order.status)}</span>
                    <span className="ops-list-amount">{formatPriceLKR(order.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
