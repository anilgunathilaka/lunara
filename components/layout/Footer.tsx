import { MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { LanguageSelector, type LanguageSelectorProps } from '@/components/layout/LanguageSelector';
import { FooterNewsletter } from '@/components/layout/FooterNewsletter';
import { BackToTop } from '@/components/layout/BackToTop';
import { Icon } from '@/components/primitives/Icon';

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterProps {
  usefulLinks: FooterLink[];
  supportLinks: FooterLink[];
  policyLinks: FooterLink[];
  /** FR-47: published business registration number, address and a human-answered phone. */
  registrationNumber: string;
  address: string;
  phone: string;
  whatsappHref: string;
  whatsappLabel: string;
  languageLabels: LanguageSelectorProps['labels'];
  labels: {
    usefulLinksHeading: string;
    customerServiceHeading: string;
    newsletterHeading: string;
    newsletterBody: string;
    newsletterEmailLabel: string;
    newsletterPlaceholder: string;
    newsletterSubscribe: string;
    newsletterThanks: string;
    newsletterDisclaimer: string;
    copyright: string;
    backToTop: string;
    paymentsHeading: string;
    paymentBank: string;
    paymentCod: string;
    paymentLankaQr: string;
    paymentCard: string;
  };
}

/** docs/3-components.md §6.2 — --lun-plum-deep ground; Jolie-style 4-column layout. */
export function Footer({
  usefulLinks,
  supportLinks,
  policyLinks,
  registrationNumber,
  address,
  phone,
  whatsappHref,
  whatsappLabel,
  languageLabels,
  labels,
}: FooterProps) {
  const customerServiceLinks = [...supportLinks, ...policyLinks];
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link href="/">
              <Wordmark tone="inverted" />
            </Link>
            <div className="site-footer-legal">
              <p>{address}</p>
              <p>{phone}</p>
              <p>{registrationNumber}</p>
            </div>
            <div className="site-footer-social">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-social-link focus-ring"
                aria-label={whatsappLabel}
              >
                <Icon icon={MessageCircle} />
              </a>
            </div>
            <LanguageSelector labels={languageLabels} className="site-footer-language" />
          </div>

          <nav className="site-footer-column" aria-labelledby="footer-useful-heading">
            <h2 id="footer-useful-heading" className="site-footer-heading">
              {labels.usefulLinksHeading}
            </h2>
            <ul className="site-footer-list">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="site-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer-column" aria-labelledby="footer-service-heading">
            <h2 id="footer-service-heading" className="site-footer-heading">
              {labels.customerServiceHeading}
            </h2>
            <ul className="site-footer-list">
              {customerServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="site-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <FooterNewsletter
            heading={labels.newsletterHeading}
            body={labels.newsletterBody}
            emailLabel={labels.newsletterEmailLabel}
            emailPlaceholder={labels.newsletterPlaceholder}
            subscribeLabel={labels.newsletterSubscribe}
            thanksLabel={labels.newsletterThanks}
            disclaimer={labels.newsletterDisclaimer}
            privacyHref="/policies/privacy"
            termsHref="/policies/terms"
            privacyLabel={policyLinks.find((l) => l.href.includes('privacy'))?.label ?? 'Privacy'}
            termsLabel={policyLinks.find((l) => l.href.includes('terms'))?.label ?? 'Terms'}
          />
        </div>

        <div className="site-footer-bottom">
          <p className="site-footer-copyright">
            {labels.copyright.replace('{year}', String(year))}
          </p>
          <div className="site-footer-payments" aria-label={labels.paymentsHeading}>
            <span className="site-footer-payment-badge">{labels.paymentBank}</span>
            <span className="site-footer-payment-badge">{labels.paymentCod}</span>
            <span className="site-footer-payment-badge">{labels.paymentLankaQr}</span>
            <span className="site-footer-payment-badge">{labels.paymentCard}</span>
          </div>
        </div>
      </div>

      <BackToTop label={labels.backToTop} />
    </footer>
  );
}
