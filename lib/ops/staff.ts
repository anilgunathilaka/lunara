import 'server-only';
import { headers } from 'next/headers';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { redirect } from '@/i18n/navigation';
import { getAuth } from '@/lib/auth/auth';
import { getPrisma } from '@/lib/prisma';

/**
 * Operations access (docs/4-architecture.md §3.5): a signed-in user whose
 * email has an active STAFF_MEMBER row. Checked on the server by every ops
 * page and every ops action.
 */

export interface Staff {
  email: string;
}

/** The current staff member, or null (not signed in, or not staff). */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const email = session.user.email.toLowerCase();
  const member = await getPrisma().staffMember.findUnique({ where: { email } });
  return member?.active ? { email } : null;
});

/** For pages: signed out → sign-in (then back); signed in but not staff → 404. */
export async function requireStaffPage(locale: string, returnTo: string): Promise<Staff> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: { pathname: '/sign-in', query: { next: returnTo } }, locale });
  }
  const staff = await getStaff();
  // 404 rather than 403: don't advertise that an ops area exists.
  if (!staff) notFound();
  return staff;
}

/** For actions: anything but staff is refused outright. */
export async function requireStaffAction(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) throw new Error('Not authorised');
  return staff;
}
