import { Camera, RotateCcw, Scissors, Truck, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
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

/**
 * Footer (docs/3-components.md §6.2, layout per docs/2-ui.md §7.4): a band
 * of the four facts with their icons, then link columns and the business
 * details on a --lun-gold-pale ground, and a closing line.
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
        <div className="site-footer-grid">
          <nav className="site-footer-column" aria-label={headings.support}>
            <p className="site-footer-heading">{headings.support}</p>
            {supportLinks.map((link) => (
              <Link key={link.href} href={link.href} className="site-footer-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <nav className="site-footer-column" aria-label={headings.policies}>
            <p className="site-footer-heading">{headings.policies}</p>
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="site-footer-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-footer-column site-footer-brand">
            <Wordmark />
            <div className="site-footer-legal">
              <p>{registrationNumber}</p>
              <p>{address}</p>
              <p>{phone}</p>
            </div>
            <a href={whatsapp.href} className="site-footer-link" target="_blank" rel="noopener noreferrer">
              {whatsapp.label}
            </a>
          </div>
        </div>

        <div className="site-footer-base">
          <LanguageSelector labels={languageLabels} className="site-footer-language" />
          <p>© {new Date().getFullYear()} Lunara Sarees</p>
        </div>
      </div>
    </footer>
  );
}
