import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { StarRating } from '@/components/reviews/StarRating';
import { isDistrictId } from '@/lib/commerce/delivery';
import { formatDate } from '@/lib/format/date';
import type { PublicReview, ReviewSummary } from '@/lib/reviews/reviews';

/**
 * Customer reviews on the product page (docs/2-ui.md §7.5; founder decision
 * 2026-11-13, after killstar.com): a centred heading; the average, large,
 * with its stars and "Based on N reviews", beside a bar for each rating from
 * five stars to one; then each review in three columns: who (initial, name,
 * district, verified purchase), what (stars, words, photos as taken, any
 * reply from Lunara) and when. Every review here is from a verified order
 * (PRD FR-46). Not taken from the reference: search, filters and "was this
 * helpful?" votes.
 */
export async function ProductReviews({ reviews, summary }: { reviews: PublicReview[]; summary: ReviewSummary }) {
  const locale = await getLocale();
  const [t, tDistricts] = await Promise.all([getTranslations('reviews.show'), getTranslations('districts')]);
  const distribution = summary.distribution ?? [0, 0, 0, 0, 0];
  const most = Math.max(1, ...distribution);

  return (
    <section className="pdp-reviews" aria-labelledby="pdp-reviews-heading">
      <h2 id="pdp-reviews-heading" className="pdp-reviews-heading">
        {t('heading')}
      </h2>

      {summary.count > 0 && summary.average !== null ? (
        <div className="pdp-reviews-summary">
          <div className="pdp-reviews-score">
            <span className="pdp-reviews-average">{summary.average.toFixed(1)}</span>
            <span className="pdp-reviews-score-text">
              <StarRating value={summary.average} label={t('ratingOf', { rating: summary.average.toFixed(1) })} />
              <span className="pdp-reviews-based">{t('basedOn', { count: summary.count })}</span>
            </span>
          </div>
          <ul className="pdp-reviews-bars">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars - 1] ?? 0;
              return (
                <li key={stars} className="pdp-reviews-bar" aria-label={t('barLabel', { stars, count })}>
                  <span aria-hidden="true" className="pdp-reviews-bar-stars">
                    {stars} ★
                  </span>
                  <span aria-hidden="true" className="pdp-reviews-bar-track">
                    <span className="pdp-reviews-bar-fill" style={{ inlineSize: `${(count / most) * 100}%` }} />
                  </span>
                  <span aria-hidden="true" className="pdp-reviews-bar-count">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="pdp-reviews-none">{t('none')}</p>
      )}

      {reviews.length > 0 && (
        <ul className="pdp-reviews-list">
          {reviews.map((review) => {
            const district = isDistrictId(review.district) ? tDistricts(review.district) : review.district;
            return (
              <li key={review.id} className="pdp-review">
                <div className="pdp-review-who">
                  <span className="pdp-review-avatar" aria-hidden="true">
                    {review.displayName.trim().charAt(0)}
                  </span>
                  <span className="pdp-review-who-text">
                    <span className="pdp-review-name">
                      {review.displayName}
                      <span className="pdp-review-district">{district}</span>
                    </span>
                    <span className="pdp-review-verified">{t('verified')}</span>
                  </span>
                </div>
                <div className="pdp-review-what">
                  <StarRating value={review.rating} label={t('ratingOf', { rating: review.rating })} />
                  <p className="pdp-review-body">{review.body}</p>
                  {review.photos.length > 0 && (
                    <ul className="pdp-review-photos">
                      {review.photos.map((src, i) => (
                        <li key={src} className="pdp-review-photo">
                          <Image src={src} alt={t('photoAlt', { name: review.displayName, n: i + 1 })} fill sizes="96px" />
                        </li>
                      ))}
                    </ul>
                  )}
                  {review.response && (
                    <div className="pdp-review-response">
                      <p className="pdp-review-response-from">
                        {t('responseFrom')}
                        {review.respondedAt ? ` · ${formatDate(review.respondedAt, locale)}` : ''}
                      </p>
                      <p className="pdp-review-body">{review.response}</p>
                    </div>
                  )}
                </div>
                <time className="pdp-review-date" dateTime={review.createdAt.toISOString()}>
                  {formatDate(review.createdAt, locale)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
