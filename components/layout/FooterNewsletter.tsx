'use client';

import { useState, type FormEvent } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';

export interface FooterNewsletterProps {
  heading: string;
  body: string;
  emailLabel: string;
  emailPlaceholder: string;
  subscribeLabel: string;
  thanksLabel: string;
  disclaimer: string;
  privacyHref: string;
  termsHref: string;
  privacyLabel: string;
  termsLabel: string;
}

/**
 * Presentational newsletter block — Jolie footer structure. Capture is not
 * wired to a backend yet; the form acknowledges locally so the layout is
 * usable without inventing a mailing-list integration.
 */
export function FooterNewsletter({
  heading,
  body,
  emailLabel,
  emailPlaceholder,
  subscribeLabel,
  thanksLabel,
  disclaimer,
  privacyHref,
  termsHref,
  privacyLabel,
  termsLabel,
}: FooterNewsletterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="site-footer-newsletter">
      <h2 className="site-footer-heading">{heading}</h2>
      <p className="site-footer-newsletter-body">{body}</p>
      {submitted ? (
        <p className="site-footer-newsletter-thanks" role="status">
          {thanksLabel}
        </p>
      ) : (
        <form className="site-footer-newsletter-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="footer-newsletter-email">
            {emailLabel}
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="site-footer-newsletter-input focus-ring"
          />
          <Button type="submit" size="md">
            {subscribeLabel}
          </Button>
        </form>
      )}
      <p className="site-footer-newsletter-disclaimer">
        {disclaimer}{' '}
        <Link href={termsHref} className="site-footer-inline-link">
          {termsLabel}
        </Link>{' '}
        ·{' '}
        <Link href={privacyHref} className="site-footer-inline-link">
          {privacyLabel}
        </Link>
      </p>
    </div>
  );
}
