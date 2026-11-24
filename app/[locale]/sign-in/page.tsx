import type { Metadata } from 'next';
import { Heart, KeyRound, Package } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SignInForm } from '@/components/account/SignInForm';
import { Icon } from '@/components/primitives/Icon';
import { Link } from '@/i18n/navigation';
import { whatsappLink } from '@/lib/commerce/business';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Only same-site paths: never redirect off-site after sign-in (open-redirect guard). */
function safeNext(value: string | string[] | undefined, locale: string): string {
  // Plain sign-in: staff → operations, customers → their orders (account/start).
  const fallback = `/${locale}/account/start`;
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback;
  // Parse it the way the browser will: browsers drop tabs and newlines and
  // read "\" as "/", so "/\t/evil.example" would otherwise leave the site.
  // Resolved against a placeholder origin, anything off-site changes the origin.
  const base = 'https://lunara.invalid';
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Sign in (founder decision 2026-11-24: a fuller page): one card in the
 * middle of the white page, with a welcome, the two steps
 * (email, code) and what an account gives. Accounts stay optional: the page says so and
 * leads back to shopping as a guest (PRD FR-33).
 */
export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { next } = await searchParams;
  const t = await getTranslations('auth.signIn');

  return (
    <div className="signin-page">
      <div className="signin-panel">
        <div className="signin-card">
          <h1 className="signin-title">{t('welcome')}</h1>
          <p className="signin-sub">{t('subtitle')}</p>

          <SignInForm next={safeNext(next, locale)} showSteps />

          <ul className="signin-perks">
            <li>
              <Icon icon={KeyRound} size="inline" />
              {t('perkNoPassword')}
            </li>
            <li>
              <Icon icon={Package} size="inline" />
              {t('perkOrders')}
            </li>
            <li>
              <Icon icon={Heart} size="inline" />
              {t('perkFavourites')}
            </li>
          </ul>

          <div className="signin-foot">
            <p className="field-message">
              {t('guestNote')}{' '}
              <Link href="/shop" className="signin-link focus-ring">
                {t('guestLink')}
              </Link>
            </p>
            <p className="field-message">
              {t.rich('help', {
                link: (chunks) => (
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="signin-link focus-ring">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
