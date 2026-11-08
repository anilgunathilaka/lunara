import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { galleryPhotoAction } from '@/lib/ops/actions';
import { photoRows } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { MAX_GALLERY_PHOTOS } from '@/lib/media/photos';
import { OpsFlash, type OpsSearchParams } from '../shared';
import { PhotoUpload } from './PhotoUpload';

/**
 * Product photography (docs/4-architecture.md §3.7, §4). Thumbnails are
 * shown unoptimised: staff see the stored bytes exactly as uploaded.
 */

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="ops-photo">
      <Image src={src} alt={alt} fill sizes="120px" unoptimized />
    </span>
  );
}

export default async function OpsPhotosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/photos`);
  const [rows, query, t] = await Promise.all([photoRows(), searchParams, getTranslations('ops.photos')]);

  return (
    <div className="flex flex-col gap-6">
      <OpsFlash searchParams={query} />
      <p className="field-message" style={{ maxWidth: '68ch' }}>
        {t('intro', { max: MAX_GALLERY_PHOTOS })}
      </p>

      <section className="flex flex-col gap-4" aria-labelledby="sarees-heading">
        <h2 id="sarees-heading" className="checkout-step-title">
          {t('sareesHeading')}
        </h2>
        <ul className="flex flex-col">
          {rows.sarees.map((row) => (
            <li key={row.id} className="ops-photo-row">
              <div className="spec-row">
                <strong>{row.name}</strong>
                <span className="spec-row-term">{row.sku}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="field-label">{t('galleryLabel', { count: row.gallery.length, max: MAX_GALLERY_PHOTOS })}</span>
                {row.gallery.length === 0 ? (
                  <p className="field-message">{t('noPhotos')}</p>
                ) : (
                  <ul className="ops-photo-grid">
                    {row.gallery.map((photo, i) => (
                      <li key={photo.key} className="flex flex-col gap-1">
                        <Thumb src={photo.url} alt={t('photoAlt', { name: row.name, n: i + 1 })} />
                        {i === 0 ? (
                          <span className="field-message">{t('cover')}</span>
                        ) : (
                          <form action={galleryPhotoAction}>
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="key" value={photo.key} />
                            <input type="hidden" name="op" value="cover" />
                            <button type="submit" className="btn focus-ring btn-tertiary btn-sm">
                              {t('makeCover')}
                            </button>
                          </form>
                        )}
                        <form action={galleryPhotoAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="key" value={photo.key} />
                          <input type="hidden" name="op" value="remove" />
                          <button type="submit" className="btn focus-ring btn-tertiary btn-sm">
                            {t('remove')}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                {row.gallery.length < MAX_GALLERY_PHOTOS && (
                  <PhotoUpload kind="gallery" id={row.id} label={t('addPhotos')} multiple />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="field-label">{t('referenceLabel')}</span>
                {row.referenceFrame ? (
                  <>
                    <Thumb src={row.referenceFrame} alt={t('referenceAlt', { name: row.name })} />
                    <p className="field-message">{t('referenceLocked')}</p>
                  </>
                ) : (
                  <>
                    <p className="field-message">{t('referenceHint')}</p>
                    <PhotoUpload kind="reference" id={row.id} label={t('uploadReference')} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="jackets-heading">
        <h2 id="jackets-heading" className="checkout-step-title">
          {t('jacketsHeading')}
        </h2>
        <ul className="flex flex-col">
          {rows.jackets.map((row) => (
            <li key={row.id} className="ops-photo-row">
              <div className="spec-row">
                <strong>{row.name}</strong>
                <span className="spec-row-term">{row.sku}</span>
              </div>
              {row.swatch ? <Thumb src={row.swatch} alt={t('swatchAlt', { name: row.name })} /> : <p className="field-message">{t('noPhotos')}</p>}
              <PhotoUpload kind="swatch" id={row.id} label={row.swatch ? t('replaceSwatch') : t('uploadSwatch')} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
