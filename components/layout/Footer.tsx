import { Camera, RotateCcw, Scissors, Truck, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/motion/Reveal';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { SubscribeForm } from '@/components/layout/SubscribeForm';

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
 * Footer (docs/3-components.md §6.2, layout per docs/2-ui.md §7.4): the
 * four facts with their icons, Support and Policies, the language selector
 * and the closing line. The layout and motion follow almadalabel.com
 * (founder decision 2026-11-23): the link columns, LUNARA across the full
 * width, each part fading up as it scrolls in. The business block (logo,
 * registration number, address, phone, WhatsApp row) was removed (founder
 * decision 2026-11-23); WhatsApp stays as the floating button.
 */
export function Footer({
  supportLinks,
  policyLinks,
  headings,
  trust,
  languageLabels,
}: FooterProps) {
  const t = useTranslations('layout.footer');
  return (
    <footer className="site-footer-wrap">
      {/* The footer as a panel with rounded lower corners, sitting over the
          subscribe band (founder decision 2026-11-24, after developeroffice.com). */}
      <div className="site-footer-panel">
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
          <Reveal className="site-footer-columns">
            {/* The Support links in one centred row (founder decision 2026-11-23);
                the heading stays for screen readers only. */}
            <nav className="site-footer-row" aria-label={headings.support}>
              <p className="sr-only">{headings.support}</p>
              {supportLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-footer-link focus-ring">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="site-footer-row">
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
          {/* The closing line, centred: copyright, then the policy links on the
              same line (founder decision 2026-11-23). */}
          <div className="site-footer-legal">
            <p className="site-footer-copyright">© {new Date().getFullYear()} {BRAND}</p>
            <nav className="site-footer-legal-links" aria-label={headings.policies}>
              {policyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-footer-link site-footer-legal-link focus-ring">
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* Designer credit, on the same line (founder decision 2026-11-23). */}
            <p className="site-footer-credit">
              {t.rich('credit', {
                link: (chunks) => (
                  <a href="https://ayulian.com" target="_blank" rel="noopener" className="site-footer-credit-link focus-ring">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </Reveal>
      </div>
      </div>

      <SubscribeForm />
    </footer>
  );
}
