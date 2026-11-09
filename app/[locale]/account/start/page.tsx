import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCustomer } from '@/lib/account/customer';
import { getStaff } from '@/lib/ops/staff';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Where the header's account icon and a plain sign-in land (docs/1-ux.md §1
 * ACCOUNT): staff → the operations panel, customers → their orders, signed
 * out → sign-in, then back here. Never a page of its own.
 */
export default async function AccountStartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getStaff()) redirect({ href: '/ops', locale });
  if (await getCustomer()) redirect({ href: '/account', locale });
  redirect({ href: { pathname: '/sign-in', query: { next: `/${locale}/account/start` } }, locale });
}
