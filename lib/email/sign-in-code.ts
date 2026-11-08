import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createTranslator, hasLocale } from 'next-intl';
import { Resend } from 'resend';
import { routing, type AppLocale } from '@/i18n/routing';
import en from '@/messages/en.json';
import si from '@/messages/si.json';
import ta from '@/messages/ta.json';

/**
 * Passwordless sign-in code email (docs/4-architecture.md §2.1).
 * Email is a supplementary channel (docs/1-ux.md §3.5); this is only the
 * optional account layer, never part of checkout.
 */

const MESSAGES = { en, si, ta } as const;

export const SIGN_IN_CODE_TTL_SECONDS = 10 * 60;

/** Locale from next-intl's NEXT_LOCALE cookie on the auth request, else the default. */
export function localeFromRequest(request: Request | undefined): AppLocale {
  const cookie = request?.headers.get('cookie') ?? '';
  const match = /(?:^|;\s*)NEXT_LOCALE=([^;]+)/.exec(cookie);
  const value = match?.[1];
  return value && hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

function compose(locale: AppLocale, code: string) {
  const t = createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: 'auth.signInEmail',
  });
  const body = t('body', { code, minutes: SIGN_IN_CODE_TTL_SECONDS / 60 });
  const ignore = t('ignore');
  return {
    subject: t('subject'),
    text: `${body}\n\n${ignore}`,
    // Plain, unstyled HTML: no colours or fonts, so nothing here needs tokens.
    html: `<p>${escapeHtml(body)}</p><p><strong style="font-size:1.5em;letter-spacing:0.2em">${escapeHtml(code)}</strong></p><p>${escapeHtml(ignore)}</p>`,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);
}

async function deliver(to: string, locale: AppLocale, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production') {
      // Development without Resend configured: surface the code locally.
      console.info(`[auth] sign-in code for ${to} (${locale}): ${code}`);
      return;
    }
    throw new Error('RESEND_API_KEY and EMAIL_FROM must be set to send sign-in codes.');
  }

  const { subject, text, html } = compose(locale, code);
  const { error } = await new Resend(apiKey).emails.send({ from, to, subject, text, html });
  if (error) {
    // Never log the code itself in production.
    console.error('[auth] sign-in code email failed:', error.name, error.message);
  }
}

/**
 * Sends the code without making the auth response wait for it (Better Auth
 * advises this against timing attacks). On the Worker, waitUntil keeps the
 * send alive after the response; elsewhere the promise simply runs on.
 */
export function sendSignInCode(email: string, code: string, request: Request | undefined): Promise<void> {
  const sending = deliver(email, localeFromRequest(request), code).catch((err: unknown) => {
    console.error('[auth] sign-in code email error:', err instanceof Error ? err.message : err);
  });

  if (process.env.NODE_ENV === 'production') {
    try {
      getCloudflareContext().ctx.waitUntil(sending);
      return Promise.resolve();
    } catch {
      // Not on a Worker (e.g. `next start`): fall through and let it run.
    }
  }
  void sending;
  return Promise.resolve();
}
