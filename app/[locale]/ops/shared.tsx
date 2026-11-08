import { getTranslations } from 'next-intl/server';

/** Server-side helpers shared by the ops pages. */

export type OpsSearchParams = Promise<Record<string, string | string[] | undefined>>;

const ERROR_CODES = ['invalid', 'conflict', 'negative', 'tracking'] as const;

/** Outcome of the last action, from ?saved=1 / ?error=<code> (lib/ops/actions.ts). */
export async function OpsFlash({ searchParams }: { searchParams: Awaited<OpsSearchParams> }) {
  const t = await getTranslations('ops');
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined;
  if (error && (ERROR_CODES as readonly string[]).includes(error)) {
    return (
      <p className="field-message-error" role="alert">
        {t(`error.${error as (typeof ERROR_CODES)[number]}`)}
      </p>
    );
  }
  if (searchParams.saved === '1') {
    return (
      <p className="field-message" role="status">
        {t('saved')}
      </p>
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
