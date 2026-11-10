import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { opsBadges } from '@/lib/ops/dashboard';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsShell } from './OpsChrome';

// Staff-only: never indexed (docs/4-architecture.md §3.5).
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** The operations panel in its own frame, without the store's header and footer (§3.14). */
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
  const badges = await opsBadges();

  return (
    <OpsShell email={staff.email} badges={badges}>
      {children}
    </OpsShell>
  );
}
