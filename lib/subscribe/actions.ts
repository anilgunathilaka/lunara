'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { normaliseSriLankanMobile } from '@/lib/commerce/cart-ref';

/**
 * The subscribe form after the footer (founder decision 2026-11-24): an
 * email, a Sri Lankan mobile number, or both. Submitting is the consent;
 * consentAt records when. Signing up again with the same email or mobile
 * updates that person's row instead of adding a second one.
 */

export type SubscribeState =
  | { status: 'idle' }
  | { status: 'done' }
  | { status: 'invalid'; field: 'none' | 'email' | 'phone' }
  | { status: 'error' };

const formSchema = z.object({
  locale: z.enum(['en', 'si', 'ta']).catch('en'),
  email: z.string().trim().toLowerCase().max(200).catch(''),
  phone: z.string().trim().max(20).catch(''),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().catch(''),
});

const emailSchema = z.email();

export async function subscribeAction(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  const { locale, email: rawEmail, phone: rawPhone, website } = formSchema.parse(Object.fromEntries(form));
  // A bot filled the hidden field: answer as if it worked, store nothing.
  if (website) return { status: 'done' };

  if (!rawEmail && !rawPhone) return { status: 'invalid', field: 'none' };
  if (rawEmail && !emailSchema.safeParse(rawEmail).success) return { status: 'invalid', field: 'email' };
  const phone = rawPhone ? normaliseSriLankanMobile(rawPhone) : null;
  if (rawPhone && !phone) return { status: 'invalid', field: 'phone' };
  const email = rawEmail || null;

  try {
    const prisma = getPrisma();
    const now = new Date();
    const existing = await prisma.subscriber.findFirst({
      where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      await prisma.subscriber.update({
        where: { id: existing.id },
        data: { email: email ?? existing.email, phone: phone ?? existing.phone, locale, consentAt: now },
      });
    } else {
      await prisma.subscriber.create({ data: { email, phone, locale, consentAt: now } });
    }
    return { status: 'done' };
  } catch (error) {
    // The email belongs to one sign-up and the mobile to another: both are
    // already on the list, so the person is subscribed either way.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { status: 'done' };
    console.error('subscribe failed', error);
    return { status: 'error' };
  }
}
