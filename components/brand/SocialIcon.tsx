import type { SocialNetwork } from '@/lib/commerce/business';

/**
 * Social network marks drawn in the same line style as the Lucide icons
 * around them (24 grid, 2 stroke, round joins). Lucide 1.x ships no brand
 * icons, so these three live here. Decorative: the link carries the name.
 */
const PATHS: Record<SocialNetwork, React.ReactNode> = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  Facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  TikTok: <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5" />,
};

export function SocialIcon({ network, className }: { network: SocialNetwork; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[network]}
    </svg>
  );
}
