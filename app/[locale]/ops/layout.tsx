import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsNav, SignOutButton } from './OpsChrome';

// Staff-only: never indexed (docs/4-architecture.md §3.5).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OpsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await requireStaffPage(locale, `/${locale}/ops`);
  const t = await getTranslations('ops');

  return (
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="home-section-title">{t('title')}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
              {t('signedInAs', { email: staff.email })}
            </span>
            <SignOutButton />
          </div>
        </div>
        <OpsNav />
        {children}
      </div>
    </div>
  );
}
