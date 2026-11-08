import 'server-only';
import { Resend } from 'resend';

/**
 * Channel providers (docs/4-architecture.md §6.1). Email is the only
 * automatic channel today; WhatsApp Business API and SMS are added here
 * when accounts exist, at which point their outbox rows become automatic.
 */

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);
}

/** Throws on failure so the caller can back off and retry. */
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) throw new Error('Email is not configured');
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject,
    text: body,
    // Plain, unstyled HTML: no colours or fonts, so nothing here needs tokens.
    html: `<p>${escapeHtml(body).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`,
  });
  if (error) throw new Error(`${error.name}: ${error.message}`);
}
