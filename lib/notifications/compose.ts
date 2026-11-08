import 'server-only';
import { createTranslator } from 'next-intl';
import type { NotificationChannel, NotificationStatus, Prisma } from '@prisma/client';
import { routing, type AppLocale } from '@/i18n/routing';
import { BANK_TRANSFER } from '@/lib/commerce/business';
import { formatPriceLKR } from '@/lib/pricing/format';
import en from '@/messages/en.json';
import si from '@/messages/si.json';
import ta from '@/messages/ta.json';
import { emailConfigured } from './providers';

/**
 * Which messages an order event produces, rendered in the order's language
 * (docs/4-architecture.md §6.1). Rows are written to the outbox in the same
 * transaction as the order change.
 */

const MESSAGES = { en, si, ta } as const;
const DAY_MS = 24 * 60 * 60 * 1000;

export type NotifiableEvent = 'placed' | 'confirmed' | 'packed' | 'dispatched' | 'cancelled' | 'delivered';

type Template =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'cancelled'
  | 'deliveredDay1'
  | 'deliveredDay3'
  | 'deliveredDay14'
  | 'deliveredDay45';

interface Route {
  template: Template;
  channels: NotificationChannel[];
  afterDays: number;
}

const ROUTES: Record<NotifiableEvent, Route[]> = {
  placed: [{ template: 'placed', channels: ['whatsapp', 'sms', 'email'], afterDays: 0 }],
  confirmed: [{ template: 'confirmed', channels: ['whatsapp', 'email'], afterDays: 0 }],
  packed: [{ template: 'packed', channels: ['whatsapp', 'email'], afterDays: 0 }],
  dispatched: [{ template: 'dispatched', channels: ['whatsapp', 'sms', 'email'], afterDays: 0 }],
  cancelled: [{ template: 'cancelled', channels: ['whatsapp', 'sms', 'email'], afterDays: 0 }],
  delivered: [
    { template: 'deliveredDay1', channels: ['whatsapp'], afterDays: 1 },
    { template: 'deliveredDay3', channels: ['whatsapp'], afterDays: 3 },
    { template: 'deliveredDay14', channels: ['whatsapp', 'email'], afterDays: 14 },
    { template: 'deliveredDay45', channels: ['email'], afterDays: 45 },
  ],
};

export function isNotifiable(status: string): status is NotifiableEvent {
  return Object.hasOwn(ROUTES, status);
}

/** Public origin for links in messages (wrangler var on the Worker, .env locally). */
export function siteUrl(): string {
  return (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
}

export interface OrderForMessages {
  id: string;
  number: string;
  customerName: string;
  phone: string;
  email: string | null;
  locale: string;
  total: number;
  paymentMethod: string;
  estimateMinDays: number;
  estimateMaxDays: number;
  courier: string | null;
  trackingNumber: string | null;
}

function bankLine(): string | null {
  if (BANK_TRANSFER.isPlaceholder) return null;
  return `${BANK_TRANSFER.bankName}, ${BANK_TRANSFER.branch}, ${BANK_TRANSFER.accountName}, ${BANK_TRANSFER.accountNumber}`;
}

export function composeNotifications(
  event: NotifiableEvent,
  order: OrderForMessages,
  options: { confirmationLink?: string; now?: Date } = {},
): Prisma.NotificationCreateManyInput[] {
  const locale: AppLocale = (routing.locales as readonly string[]).includes(order.locale)
    ? (order.locale as AppLocale)
    : routing.defaultLocale;
  const t = createTranslator({ locale, messages: MESSAGES[locale], namespace: 'notifications' });
  const tDelivery = createTranslator({ locale, messages: MESSAGES[locale], namespace: 'commerce.delivery' });
  const now = options.now ?? new Date();
  const site = siteUrl();
  const params = {
    name: order.customerName,
    number: order.number,
    total: formatPriceLKR(order.total),
    estimate: tDelivery('estimateDays', { min: order.estimateMinDays, max: order.estimateMaxDays }),
    link: options.confirmationLink ?? `${site}/${locale}`,
    courier: order.courier ?? '',
    tracking: order.trackingNumber ?? '',
    careLink: `${site}/${locale}/support/care-guide`,
    returnsLink: `${site}/${locale}/support/returns`,
    jacketLink: `${site}/${locale}/jacket-material`,
  };

  function render(template: Template): { subject: string | null; body: string } {
    switch (template) {
      case 'placed': {
        if (order.paymentMethod === 'cod') return { subject: t('placedCodSubject', params), body: t('placedCod', params) };
        const bank = bankLine();
        return {
          subject: t('placedBankSubject', params),
          body: bank ? t('placedBank', { ...params, bank }) : t('placedBankDetailsToFollow', params),
        };
      }
      case 'dispatched':
        return {
          subject: t('dispatchedSubject', params),
          body: order.paymentMethod === 'cod' ? t('dispatchedCod', params) : t('dispatched', params),
        };
      case 'deliveredDay1':
      case 'deliveredDay3':
        return { subject: null, body: t(template, params) };
      default:
        return { subject: t(`${template}Subject`, params), body: t(template, params) };
    }
  }

  const rows: Prisma.NotificationCreateManyInput[] = [];
  for (const route of ROUTES[event]) {
    const { subject, body } = render(route.template);
    for (const channel of route.channels) {
      if (channel === 'email' && (!order.email || !emailConfigured())) continue;
      // No WhatsApp/SMS provider yet: staff send these from ops (§6.1).
      const status: NotificationStatus = channel === 'email' ? 'pending' : 'manual';
      rows.push({
        orderId: order.id,
        event: route.template,
        channel,
        recipient: channel === 'email' ? order.email! : order.phone,
        locale,
        subject: channel === 'email' ? subject : null,
        body,
        status,
        dueAt: new Date(now.getTime() + route.afterDays * DAY_MS),
      });
    }
  }
  return rows;
}
