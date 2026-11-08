import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { SignInForm } from '@/components/account/SignInForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Only same-site paths: never redirect off-site after sign-in (open-redirect guard). */
function safeNext(value: string | string[] | undefined, locale: string): string {
  const fallback = `/${locale}`;
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

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
    <div className="home-section">
      <div className="home-section-inner flex flex-col gap-4" style={{ maxWidth: '420px' }}>
        <div>
          <SectionMarker />
          <h1 className="home-section-title">{t('title')}</h1>
        </div>
        <SignInForm next={safeNext(next, locale)} />
      </div>
    </div>
  );
}
