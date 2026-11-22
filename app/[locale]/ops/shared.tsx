import { getTranslations } from 'next-intl/server';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isOpsDoneCode } from '@/lib/ops/done';
import { FlashReveal } from './FlashReveal';

/** Server-side helpers shared by the ops pages. */

export type OpsSearchParams = Promise<Record<string, string | string[] | undefined>>;

const ERROR_CODES = [
  'invalid',
  'conflict',
  'negative',
  'tracking',
  'exists',
  'inUse',
  'sold',
  'notFound',
  'stock',
  'discount',
  'overpay',
  'phone',
  'phoneTaken',
  'planDates',
  'planMismatch',
] as const;

/**
 * Outcome of the last action, from ?saved=<code> / ?error=<code>
 * (lib/ops/flow.ts, lib/ops/done.ts): a clear box at the top of the page
 * saying what just happened — "Saree added", "Stock updated" — or what
 * went wrong.
 */
export async function OpsFlash({ searchParams }: { searchParams: Awaited<OpsSearchParams> }) {
  const t = await getTranslations('ops');
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined;
  if (error && (ERROR_CODES as readonly string[]).includes(error)) {
    return (
      <FlashReveal>
        <p className="ops-flash ops-flash-error" role="alert">
          <AlertCircle aria-hidden="true" className="ops-flash-icon" />
          {t(`error.${error as (typeof ERROR_CODES)[number]}`)}
        </p>
      </FlashReveal>
    );
  }
  const saved = searchParams.saved;
  if (saved === '1' || isOpsDoneCode(saved)) {
    return (
      <FlashReveal>
        <p className="ops-flash ops-flash-success" role="status">
          <CheckCircle2 aria-hidden="true" className="ops-flash-icon" />
          {saved === '1' ? t('saved') : t(`done.${saved}`)}
        </p>
      </FlashReveal>
    );
  }
  return null;
}

export { formatDateTime } from '@/lib/format/date';

/** "3 h", "2 d" — how long a bank transfer has been waiting. */
export function formatAge(from: Date, now: Date = new Date()): string {
  const hours = Math.floor((now.getTime() - from.getTime()) / 3_600_000);
  return hours < 48 ? `${hours} h` : `${Math.floor(hours / 24)} d`;
}
