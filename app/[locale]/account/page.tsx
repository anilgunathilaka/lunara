import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { FavouritesGrid } from '@/components/account/FavouritesGrid';
import { ProfileTabs, type ProfileTabKey } from '@/components/account/ProfileTabs';
import { FINISHED_STATUSES, getCustomerProfile, requireCustomerPage } from '@/lib/account/customer';
import { updateProfileNameAction } from '@/lib/account/profile-actions';
import { isDistrictId } from '@/lib/commerce/delivery';
import { formatDate } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The customer's profile (founder decision 2026-11-24; docs/1-ux.md §1
 * ACCOUNT): who they are, the orders still on their way with tracking, every
 * order, and their favourite sarees. Accounts stay optional and are offered
 * after purchase, never before (PRD FR-33).
 */
export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ profile?: string; tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await requireCustomerPage(locale, `/${locale}/account`);
  const [{ user, orders }, query, t, tStatus, tDistricts] = await Promise.all([
    getCustomerProfile(customer),
    searchParams,
    getTranslations('account'),
    getTranslations('commerce.orderStatus'),
    getTranslations('districts'),
  ]);

  const email = user?.email ?? customer.email;
  const name = user?.name && user.name.trim() && user.name !== email ? user.name : '';
  const initial = (name || email).trim().charAt(0).toUpperCase();
  const latest = orders[0];
  const active = orders.filter((o) => !(FINISHED_STATUSES as readonly string[]).includes(o.status));
  const district = (id: string) => (isDistrictId(id) ? tDistricts(id) : id);
  const TAB_KEYS: ProfileTabKey[] = ['details', 'orders', 'history', 'favourites'];
  // After saving the name, back on My details; otherwise ?tab=, else Track my orders.
  const initialTab: ProfileTabKey = query.profile ? 'details' : TAB_KEYS.find((k) => k === query.tab) ?? 'orders';

  return (
    <div className="home-section">
      <div className="home-section-inner profile-page">
        <SectionMarker />

        {/* Who you are */}
        <div className="profile-head">
          <span className="account-avatar account-avatar-xl" aria-hidden="true">
            {initial}
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="home-section-title">{name || t('profileTitle')}</h1>
            <p className="field-message">{email}</p>
            {user && <p className="field-message ops-muted">{t('memberSince', { date: formatDate(user.createdAt, locale) })}</p>}
          </div>
        </div>

        {/* My details, Track my orders, Order history, Favourite sarees as tabs; Track my orders first (founder decision 2026-11-24). */}
        <ProfileTabs
          initial={initialTab}
          tabs={[
            {
              key: 'details',
              label: t('detailsHeading'),
              panel: (
                <>
                  {query.profile === 'saved' && (
                    <p className="field-message" role="status">
                      {t('nameSaved')}
                    </p>
                  )}
                  <form action={updateProfileNameAction} className="profile-name-form">
                    <input type="hidden" name="locale" value={locale} />
                    <label htmlFor="profile-name" className="field-label">
                      {t('nameLabel')}
                    </label>
                    <div className="profile-name-row">
                      <input id="profile-name" name="name" className="input" defaultValue={name} maxLength={80} required autoComplete="name" />
                      <button type="submit" className="btn focus-ring btn-secondary btn-md">
                        {t('saveName')}
                      </button>
                    </div>
                    {query.profile === 'invalid' && <p className="field-message">{t('nameInvalid')}</p>}
                  </form>
                  <dl className="profile-details">
                    <div>
                      <dt>{t('emailLabel')}</dt>
                      <dd>{email}</dd>
                    </div>
                    {latest && (
                      <>
                        <div>
                          <dt>{t('phoneLabel')}</dt>
                          <dd>{latest.phone}</dd>
                        </div>
                        <div>
                          <dt>{t('addressLabel')}</dt>
                          <dd>
                            {latest.addressLine}, {district(latest.district)}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                  {latest && <p className="field-message ops-muted">{t('fromLatestOrder')}</p>}
                </>
              ),
            },
            {
              key: 'orders',
              label: t('trackingHeading'),
              panel: (
                <>
                  {active.length === 0 ? (
                    <p className="field-message">{t('noActiveOrders')}</p>
                  ) : (
                    <ul className="flex flex-col">
                      {active.map((order) => (
                        <li key={order.number}>
                          <Link href={`/account/orders/${order.number}`} className="account-order focus-ring">
                            <span className="flex flex-col">
                              <strong>{order.number}</strong>
                              <span className="order-timeline-time">{formatDate(order.createdAt, locale)}</span>
                              {order.trackingNumber && (
                                <span className="order-timeline-time">
                                  {order.courier ? `${order.courier} · ` : ''}
                                  {t('trackingNumber', { number: order.trackingNumber })}
                                </span>
                              )}
                            </span>
                            <span className="flex flex-col account-order-end">
                              <span className="profile-status">{tStatus(order.status)}</span>
                              <span className="order-timeline-time">{t('seeProgress')}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ),
            },
            {
              key: 'history',
              label: t('historyHeading'),
              panel: (
                <>
                  {orders.length === 0 ? (
                    <div className="flex flex-col gap-3">
                      <p className="field-message">{t('noOrders')}</p>
                      <Link href="/shop" className="btn focus-ring btn-primary btn-md" style={{ alignSelf: 'flex-start' }}>
                        {t('startShopping')}
                      </Link>
                    </div>
                  ) : (
                    <ul className="flex flex-col">
                      {orders.map((order) => (
                        <li key={order.number}>
                          <Link href={`/account/orders/${order.number}`} className="account-order focus-ring">
                            <span className="flex flex-col">
                              <strong>{order.number}</strong>
                              <span className="order-timeline-time">
                                {formatDate(order.createdAt, locale)} · {t('itemCount', { count: order._count.lines })}
                              </span>
                            </span>
                            <span className="flex flex-col account-order-end">
                              <span>{tStatus(order.status)}</span>
                              <span className="order-timeline-time">{formatPriceLKR(order.total)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ),
            },
            {
              key: 'favourites',
              label: t('favouritesHeading'),
              panel: (
                <>
                  <FavouritesGrid />
                </>
              ),
            },
          ]}
        />


      </div>
    </div>
  );
}
