/**
 * Business contact and payment details shown to customers.
 *
 * PLACEHOLDERS: replace with the real account and number before launch.
 * While `isPlaceholder` is true the confirmation page tells customers NOT
 * to transfer money, so a placeholder can never take a real payment.
 */
export const BANK_TRANSFER = {
  isPlaceholder: true,
  bankName: 'PLACEHOLDER — bank name',
  branch: 'PLACEHOLDER — branch',
  accountName: 'PLACEHOLDER — account name',
  accountNumber: '0000000000',
} as const;

/** WhatsApp line in international format without '+' (wa.me links). PLACEHOLDER. */
export const WHATSAPP_NUMBER = '94000000000';

export function whatsappLink(text?: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
