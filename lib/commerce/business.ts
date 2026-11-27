/**
 * Business contact and payment details shown to customers.
 *
 * BANK_TRANSFER is still a PLACEHOLDER: replace with the real account before launch.
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

/** Lunara's WhatsApp line (+94 70 214 4064), international format without '+' for wa.me links. */
export const WHATSAPP_NUMBER = '94702144064';

export function whatsappLink(text?: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Lunara's social media pages (founder decision 2026-11-25): footer icons and the store's schema.org sameAs. */
export const SOCIAL_LINKS = [
  { network: 'Instagram', href: 'https://www.instagram.com/lunarasarees/' },
  { network: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61585275432968' },
  { network: 'TikTok', href: 'https://www.tiktok.com/@lunara.sarees' },
] as const;

export type SocialNetwork = (typeof SOCIAL_LINKS)[number]['network'];
