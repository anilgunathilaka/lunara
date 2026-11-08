import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { markNotificationSentAction } from '@/lib/ops/actions';
import { messageQueue } from '@/lib/ops/queries';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsFlash, formatDateTime, type OpsSearchParams } from '../shared';

/** wa.me wants digits only, international format. */
function whatsappTo(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

function smsTo(phone: string, text: string): string {
  return `sms:${phone}?body=${encodeURIComponent(text)}`;
}

/**
 * Messages staff send by hand until WhatsApp/SMS providers are connected,
 * and automatic emails that gave up (docs/4-architecture.md §6.1).
 */
export default async function OpsMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/messages`);
  const [rows, query, t, tStatus] = await Promise.all([
    messageQueue(),
    searchParams,
    getTranslations('ops.messages'),
    getTranslations('ops.notificationStatus'),
  ]);

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: '720px' }}>
      <OpsFlash searchParams={query} />
      <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
        {t('intro')}
      </p>
      {rows.length === 0 ? (
        <p className="field-message">{t('none')}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row) => (
            <li key={row.id} className="ops-message">
              <div className="spec-row">
                <span>
                  <Link href={`/ops/orders/${row.order.number}`} className="focus-ring">
                    {row.order.number}
                  </Link>{' '}
                  · {row.order.customerName} · {row.channel.toUpperCase()} · {row.recipient}
                </span>
                <span className="spec-row-term">
                  {tStatus(row.status)} · {formatDateTime(row.dueAt, locale)}
                </span>
              </div>
              <p className="field-message ops-message-body">
                {row.body}
              </p>
              {row.lastError && <p className="field-message-error">{row.lastError}</p>}
              <div className="ops-inline-form">
                {row.channel === 'whatsapp' && (
                  <a href={whatsappTo(row.recipient, row.body)} target="_blank" rel="noopener noreferrer" className="btn focus-ring btn-primary btn-sm">
                    {t('openWhatsApp')}
                  </a>
                )}
                {row.channel === 'sms' && (
                  <a href={smsTo(row.recipient, row.body)} className="btn focus-ring btn-primary btn-sm">
                    {t('openSms')}
                  </a>
                )}
                <form action={markNotificationSentAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" size="sm" variant="secondary">
                    {t('markSent')}
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
