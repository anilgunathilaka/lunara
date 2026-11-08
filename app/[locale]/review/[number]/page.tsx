import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { StarRating } from '@/components/reviews/StarRating';
import { isDistrictId } from '@/lib/commerce/delivery';
import { whatsappLink } from '@/lib/commerce/business';
import {
  MAX_REVIEW_PHOTOS,
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  firstName,
  getReviewOrder,
  isReviewable,
} from '@/lib/reviews/reviews';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const ERRORS = ['invalid', 'link', 'notYet', 'exists', 'photoFormat', 'photoSize', 'photoCount'] as const;

/**
 * Write a review (docs/4-architecture.md §3.8; PRD FR-46, FR-49). Reached
 * from the signed link in the after-delivery message. A plain form: works
 * without JavaScript on any phone.
 */
export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; number: string }>;
  searchParams: Promise<{ s?: string | string[]; done?: string | string[]; error?: string | string[] }>;
}) {
  const { locale, number } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const signature = typeof query.s === 'string' ? query.s : '';
  const [order, t, tDistricts] = await Promise.all([
    getReviewOrder(number, signature),
    getTranslations('reviews.write'),
    getTranslations('districts'),
  ]);
  // A wrong or missing signature looks the same as a missing order.
  if (!order) notFound();

  const error = typeof query.error === 'string' && (ERRORS as readonly string[]).includes(query.error) ? (query.error as (typeof ERRORS)[number]) : null;
  const doneLine = typeof query.done === 'string' ? query.done : null;
  const district = isDistrictId(order.district) ? tDistricts(order.district) : order.district;

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5" style={{ maxWidth: '560px' }}>
        <div>
          <SectionMarker />
          <h1 className="home-section-title">{t('heading')}</h1>
          <p className="field-message">{t('intro', { number: order.number })}</p>
        </div>

        {error && (
          <p className="field-message-error" role="alert">
            {t(`error.${error}`, { max: MAX_REVIEW_PHOTOS })}
          </p>
        )}

        {!isReviewable(order.status) ? (
          <p className="field-message">{t('notYet')}</p>
        ) : (
          order.lines.map((line) => {
            const item = [line.title, line.materialName, line.sareeColourName].filter(Boolean).join(' · ');
            return (
              <section key={line.id} id={`line-${line.id}`} className="account-offer flex flex-col gap-4" aria-labelledby={`h-${line.id}`}>
                <h2 id={`h-${line.id}`} className="checkout-step-title">
                  {item}
                </h2>
                <p className="field-message">
                  {line.jacketMaterialName} · {line.jacketColourName}
                </p>

                {line.review ? (
                  <div className="flex flex-col gap-2" role={doneLine === line.id ? 'status' : undefined}>
                    <p className="field-message">{doneLine === line.id ? t('thanks') : t('alreadyReviewed')}</p>
                    <StarRating value={line.review.rating} label={t('ratingOf', { rating: line.review.rating })} />
                    <p className="review-body">{line.review.body}</p>
                  </div>
                ) : (
                  <form method="post" action="/api/reviews" encType="multipart/form-data" className="flex flex-col gap-4">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="number" value={order.number} />
                    <input type="hidden" name="s" value={signature} />
                    <input type="hidden" name="lineId" value={line.id} />

                    <fieldset className="flex flex-col gap-2">
                      <legend className="field-label">{t('ratingLabel')}</legend>
                      <div className="review-rating-options">
                        {[5, 4, 3, 2, 1].map((value) => (
                          <label key={value} className="review-rating-option">
                            <input type="radio" name="rating" value={value} required />
                            <span aria-hidden="true">{'★'.repeat(value)}</span>
                            <span>{t(`ratingWords.${value as 1 | 2 | 3 | 4 | 5}`)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="flex flex-col gap-1">
                      <label htmlFor={`body-${line.id}`} className="field-label">
                        {t('bodyLabel')}
                      </label>
                      <textarea
                        id={`body-${line.id}`}
                        name="body"
                        required
                        minLength={REVIEW_BODY_MIN}
                        maxLength={REVIEW_BODY_MAX}
                        rows={5}
                        className="input review-textarea"
                        aria-describedby={`body-hint-${line.id}`}
                      />
                      <p id={`body-hint-${line.id}`} className="field-message">
                        {t('bodyHint')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor={`photos-${line.id}`} className="field-label">
                        {t('photosLabel', { max: MAX_REVIEW_PHOTOS })}
                      </label>
                      <input
                        id={`photos-${line.id}`}
                        name="photos"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="field-message focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor={`name-${line.id}`} className="field-label">
                        {t('nameLabel')}
                      </label>
                      <input
                        id={`name-${line.id}`}
                        name="displayName"
                        required
                        maxLength={40}
                        defaultValue={firstName(order.customerName)}
                        className="input"
                        autoComplete="given-name"
                      />
                      <p className="field-message">{t('publicNote', { district })}</p>
                    </div>

                    <button type="submit" className="btn focus-ring btn-primary btn-md">
                      {t('submit')}
                    </button>
                  </form>
                )}
              </section>
            );
          })
        )}

        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn focus-ring btn-secondary btn-md" style={{ alignSelf: 'flex-start' }}>
          {t('helpWhatsApp')}
        </a>
      </div>
    </div>
  );
}
