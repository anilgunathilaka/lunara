import { Camera, ChevronRight, RotateCcw, Scissors, Truck, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { Reveal } from '@/components/motion/Reveal';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';

export interface FooterLink {
  href: string;
  label: string;
}

export type FooterTrustKey = 'unstitched' | 'dispatch' | 'returns' | 'colour';

export interface FooterProps {
  supportLinks: FooterLink[];
  policyLinks: FooterLink[];
  headings: { support: string; policies: string };
  /** The facts band above the footer, each with its icon. */
  trust: { key: FooterTrustKey; label: string; href: string }[];
  whatsapp: { href: string; label: string };
  /** FR-47: published business registration number, address and a human-answered phone. */
  registrationNumber: string;
  address: string;
  phone: string;
  languageLabels: LanguageSelectorProps['labels'];
}

const TRUST_ICONS: Record<FooterTrustKey, LucideIcon> = {
  unstitched: Scissors,
  dispatch: Truck,
  returns: RotateCcw,
  colour: Camera,
};

// The brand name is an invariant proper noun, the same in all three locales.
const BRAND = 'Lunara Sarees';

/**
 * Footer (docs/3-components.md §6.2, layout per docs/2-ui.md §7.4). The
 * content is unchanged: the four facts with their icons, the logo with the
 * business details and WhatsApp, Support and Policies, the language
 * selector and the closing line. The layout and motion follow
 * almadalabel.com (founder decision 2026-11-23): the business block on the
 * left with WhatsApp as an underlined row, the link columns on the right,
 * LUNARA across the full width, each part fading up as it scrolls in.
 */
export function Footer({
  supportLinks,
  policyLinks,
  headings,
  trust,
  whatsapp,
  registrationNumber,
  address,
  phone,
  languageLabels,
}: FooterProps) {
  return (
    <footer className="site-footer-wrap">
      <ul className="site-trust">
        {trust.map((item) => {
          const TrustIcon = TRUST_ICONS[item.key];
          return (
            <li key={item.key}>
              <Link href={item.href} className="site-trust-item">
                <TrustIcon className="icon" aria-hidden="true" />
                <span className="site-trust-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="site-footer">
        <div className="site-footer-top">
          <Reveal className="site-footer-talk">
            <Wordmark tone="inverted" />
            <div className="site-footer-legal">
              <p>{registrationNumber}</p>
              <p>{address}</p>
              <p>{phone}</p>
            </div>
            <a href={whatsapp.href} className="site-footer-talk-row focus-ring" target="_blank" rel="noopener noreferrer">
              <span>{whatsapp.label}</span>
              <ChevronRight className="site-footer-talk-arrow" aria-hidden="true" />
            </a>
          </Reveal>

          <Reveal className="site-footer-columns">
            <nav className="site-footer-column" aria-label={headings.support}>
              <p className="site-footer-heading">{headings.support}</p>
              {supportLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-footer-link focus-ring">
                  {link.label}
                </Link>
              ))}
            </nav>

            <nav className="site-footer-column" aria-label={headings.policies}>
              <p className="site-footer-heading">{headings.policies}</p>
              {policyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-footer-link focus-ring">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="site-footer-column">
              <LanguageSelector labels={languageLabels} className="site-footer-language" />
            </div>
          </Reveal>
        </div>

        <Reveal className="site-footer-bottom">
          {/* The name across the full width: SVG text stretched to the box, so it
              fills any screen exactly without measuring. */}
          <svg className="site-footer-mark" viewBox="0 0 1000 150" aria-hidden="true">
            <text x="0" y="138" textLength="1000" lengthAdjust="spacing">
              LUNARA
            </text>
          </svg>
          <p className="site-footer-copyright">© {new Date().getFullYear()} {BRAND}</p>
        </Reveal>
      </div>
    </footer>
  );
}
