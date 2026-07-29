import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterProps {
  supportLinks: FooterLink[];
  policyLinks: FooterLink[];
  /** FR-47: published business registration number, address and a human-answered phone. */
  registrationNumber: string;
  address: string;
  phone: string;
  languageLabels: LanguageSelectorProps['labels'];
}

/** docs/3-components.md §6.2 — --lun-plum-deep ground. */
export function Footer({
  supportLinks,
  policyLinks,
  registrationNumber,
  address,
  phone,
  languageLabels,
}: FooterProps) {
  return (
    <footer className="site-footer">
      <Wordmark tone="inverted" />

      <nav className="site-footer-links" aria-label="Support">
        {supportLinks.map((link) => (
          <Link key={link.href} href={link.href} className="site-footer-link">
            {link.label}
          </Link>
        ))}
      </nav>

      <nav className="site-footer-links" aria-label="Policies">
        {policyLinks.map((link) => (
          <Link key={link.href} href={link.href} className="site-footer-link">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="site-footer-legal">
        <p>{registrationNumber}</p>
        <p>{address}</p>
        <p>{phone}</p>
      </div>

      <LanguageSelector labels={languageLabels} className="site-footer-language" />
    </footer>
  );
}
