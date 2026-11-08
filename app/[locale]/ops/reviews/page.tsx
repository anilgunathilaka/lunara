import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { StarRating } from '@/components/reviews/StarRating';
import { respondReviewAction, reviewVisibilityAction } from '@/lib/ops/actions';
import { opsReviews } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { HIDE_REASONS } from '@/lib/reviews/reviews';
import { isDistrictId } from '@/lib/commerce/delivery';
import { OpsFlash, formatDateTime, type OpsSearchParams } from '../shared';

/**
 * Reviews for staff (docs/4-architecture.md §3.8; PRD FR-46): reply in
 * public; hide only for a listed reason, never for being critical.
 */
export default async function OpsReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/reviews`);
  const [rows, query, t, tShow, tDistricts] = await Promise.all([
    opsReviews(),
    searchParams,
    getTranslations('ops.reviews'),
    getTranslations('reviews.show'),
    getTranslations('districts'),
  ]);

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: '720px' }}>
      <OpsFlash searchParams={query} />
      <p className="field-message">{t('intro')}</p>
      {rows.length === 0 ? (
        <p className="field-message">{t('none')}</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row.id} className="ops-photo-row">
              <div className="spec-row">
                <span>
                  <Link href={`/ops/orders/${row.order.number}`} className="focus-ring">
                    {row.order.number}
                  </Link>{' '}
                  · {row.orderLine.title}
                </span>
                <span className="spec-row-term">{formatDateTime(row.createdAt, locale)}</span>
              </div>
              <StarRating value={row.rating} label={tShow('ratingOf', { rating: row.rating })} />
              <p className="review-meta">
                <strong>{row.displayName}</strong>, {isDistrictId(row.district) ? tDistricts(row.district) : row.district}
                {row.status === 'hidden' && row.hiddenReason ? ` · ${t('hiddenBecause', { reason: t(`reason.${row.hiddenReason as (typeof HIDE_REASONS)[number]}`) })}` : ''}
              </p>
              <p className="review-body">{row.body}</p>
              {row.photos.length > 0 && (
                <ul className="ops-photo-grid">
                  {row.photos.map((src, i) => (
                    <li key={src} className="ops-photo">
                      <Image src={src} alt={tShow('photoAlt', { name: row.displayName, n: i + 1 })} fill sizes="120px" unoptimized />
                    </li>
                  ))}
                </ul>
              )}

              <form action={respondReviewAction} className="flex flex-col gap-2">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={row.id} />
                <label htmlFor={`response-${row.id}`} className="field-label">
                  {t('responseLabel')}
                </label>
                <textarea id={`response-${row.id}`} name="response" defaultValue={row.response ?? ''} maxLength={2000} rows={3} className="input review-textarea" />
                <button type="submit" className="btn focus-ring btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  {row.response ? t('updateResponse') : t('publishResponse')}
                </button>
              </form>

              <form action={reviewVisibilityAction} className="ops-inline-form">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={row.id} />
                {row.status === 'published' ? (
                  <>
                    <input type="hidden" name="op" value="hide" />
                    <label htmlFor={`reason-${row.id}`} className="sr-only">
                      {t('reasonLabel')}
                    </label>
                    <select id={`reason-${row.id}`} name="reason" required defaultValue="" className="input">
                      <option value="" disabled>
                        {t('reasonLabel')}
                      </option>
                      {HIDE_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {t(`reason.${reason}`)}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn focus-ring btn-tertiary btn-sm">
                      {t('hide')}
                    </button>
                  </>
                ) : (
                  <>
                    <input type="hidden" name="op" value="show" />
                    <button type="submit" className="btn focus-ring btn-tertiary btn-sm">
                      {t('show')}
                    </button>
                  </>
                )}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
