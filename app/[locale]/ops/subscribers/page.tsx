import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPrisma } from '@/lib/prisma';
import { requireStaffPage } from '@/lib/ops/staff';
import { formatDateTime } from '../shared';

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', si: 'සිංහල', ta: 'தமிழ்' };

/**
 * People who signed up with the subscribe form after the footer (founder
 * decision 2026-11-24), newest first, with a CSV download.
 */
export default async function OpsSubscribersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/subscribers`);
  const prisma = getPrisma();
  // Wrapped so that a missing table (migration not yet run) shows a note
  // instead of breaking the page.
  const [rows, total, t] = await Promise.all([
    (async () => prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }))().catch(() => null),
    (async () => prisma.subscriber.count())().catch(() => 0),
    getTranslations('ops.subscribers'),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <p className="field-message">{t('intro')}</p>
      {rows === null ? (
        <p className="field-message">{t('unavailable')}</p>
      ) : rows.length === 0 ? (
        <p className="field-message">{t('none')}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <p className="field-message">{t('count', { count: total })}</p>
            {/* A plain link: the route answers with a file download. */}
            <a href="/api/ops/subscribers" className="btn focus-ring btn-secondary btn-sm" download>
              {t('download')}
            </a>
          </div>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th scope="col">{t('colEmail')}</th>
                  <th scope="col">{t('colPhone')}</th>
                  <th scope="col">{t('colLanguage')}</th>
                  <th scope="col">{t('colDate')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.email ?? '—'}</td>
                    <td>{row.phone ?? '—'}</td>
                    <td>{LANGUAGE_NAMES[row.locale] ?? row.locale}</td>
                    <td>{formatDateTime(row.consentAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
