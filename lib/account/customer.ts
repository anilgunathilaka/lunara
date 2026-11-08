import 'server-only';
import { headers } from 'next/headers';
import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { redirect } from '@/i18n/navigation';
import { getAuth } from '@/lib/auth/auth';
import { getPrisma } from '@/lib/prisma';

/**
 * Customer accounts (docs/4-architecture.md §3.6): optional, offered after
 * purchase, never before (PRD FR-33). An account sees the orders linked to
 * it, plus unlinked orders placed with its verified email.
 */

export interface Customer {
  id: string;
  email: string;
  emailVerified: boolean;
}

export const getCustomer = cache(async (): Promise<Customer | null> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email.toLowerCase(),
    emailVerified: session.user.emailVerified,
  };
});

/** For pages: signed out → sign-in, then back here. */
export async function requireCustomerPage(locale: string, returnTo: string): Promise<Customer> {
  const customer = await getCustomer();
  if (!customer) {
    // next-intl's redirect throws, but is not typed `never`.
    return redirect({ href: { pathname: '/sign-in', query: { next: returnTo } }, locale }) as never;
  }
  return customer;
}

/**
 * Orders this customer may see. An email match counts only for orders no
 * one has linked yet, and only once the email is verified (the sign-in code
 * proves it), so an order linked to one account never shows in another.
 */
export function ownedBy(customer: Customer): Prisma.OrderWhereInput {
  const byEmail: Prisma.OrderWhereInput[] = customer.emailVerified
    ? [{ userId: null, email: { equals: customer.email, mode: 'insensitive' } }]
    : [];
  return { OR: [{ userId: customer.id }, ...byEmail] };
}

export async function listCustomerOrders(customer: Customer) {
  return getPrisma().order.findMany({
    where: ownedBy(customer),
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { number: true, status: true, total: true, createdAt: true, _count: { select: { lines: true } } },
  });
}

const customerOrderInclude = {
  lines: { orderBy: { id: 'asc' } },
  events: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

export async function getCustomerOrder(customer: Customer, number: string) {
  if (!/^LUN-[A-Z0-9]{6}$/.test(number)) return null;
  return getPrisma().order.findFirst({
    relationLoadStrategy: 'join',
    where: { AND: [{ number }, ownedBy(customer)] },
    include: customerOrderInclude,
  });
}
