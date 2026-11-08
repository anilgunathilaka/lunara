import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { siteUrl } from '@/lib/site';

/**
 * The review link sent after delivery (docs/4-architecture.md §3.8). Signed
 * with the server secret, so it needs no stored token and cannot be forged:
 * only the customer who received the message can open their order's form.
 */

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET?.trim();
  if (!value) throw new Error('BETTER_AUTH_SECRET is not set.');
  return value;
}

export function reviewSignature(orderNumber: string): string {
  // Domain-separated: this signature can never be mistaken for any other use of the secret.
  return createHmac('sha256', secret()).update(`lunara:review:v1:${orderNumber}`).digest('base64url').slice(0, 32);
}

export function verifyReviewSignature(orderNumber: string, signature: string): boolean {
  if (!/^LUN-[A-Z0-9]{6}$/.test(orderNumber) || typeof signature !== 'string' || signature.length !== 32) return false;
  const expected = Buffer.from(reviewSignature(orderNumber));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function reviewPath(orderNumber: string, locale: string): string {
  return `/${locale}/review/${orderNumber}?s=${reviewSignature(orderNumber)}`;
}

export function reviewLink(orderNumber: string, locale: string): string {
  return `${siteUrl()}${reviewPath(orderNumber, locale)}`;
}
