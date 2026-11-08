import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { StarRating } from '@/components/reviews/StarRating';
import { isDistrictId } from '@/lib/commerce/delivery';
import { formatDate } from '@/lib/format/date';
import type { PublicReview } from '@/lib/reviews/reviews';

/**
 * Verified customer reviews (PRD FR-46): named, with district, photos as the
 * customer took them (no filter or crop), and Lunara's public reply under
 * any review that has one.
 */
export async function ReviewList({ reviews, showItem = false }: { reviews: PublicReview[]; showItem?: boolean }) {
  const locale = await getLocale();
  const [t, tDistricts] = await Promise.all([getTranslations('reviews.show'), getTranslations('districts')]);

  return (
    <ul className="flex flex-col gap-5">
      {reviews.map((review) => {
        const district = isDistrictId(review.district) ? tDistricts(review.district) : review.district;
        return (
          <li key={review.id} className="review flex flex-col gap-2">
            <StarRating value={review.rating} label={t('ratingOf', { rating: review.rating })} />
            <p className="review-meta">
              <strong>{review.displayName}</strong>, {district} · {formatDate(review.createdAt, locale)} · {t('verified')}
            </p>
            {showItem && <p className="review-meta">{review.title}</p>}
            <p className="review-body">{review.body}</p>
            {review.photos.length > 0 && (
              <ul className="review-photos">
                {review.photos.map((src, i) => (
                  <li key={src} className="review-photo">
                    <Image src={src} alt={t('photoAlt', { name: review.displayName, n: i + 1 })} fill sizes="(min-width: 768px) 160px, 30vw" />
                  </li>
                ))}
              </ul>
            )}
            {review.response && (
              <div className="review-response">
                <p className="review-meta">
                  <strong>{t('responseFrom')}</strong>
                  {review.respondedAt ? ` · ${formatDate(review.respondedAt, locale)}` : ''}
                </p>
                <p className="review-body">{review.response}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
