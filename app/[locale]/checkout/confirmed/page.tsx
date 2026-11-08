import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConfirmedClient } from './ConfirmedClient';

export default async function CheckoutConfirmedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('commerce.checkout');

  return (
    <ConfirmedClient
      heading={t('confirmedHeading')}
      orderNumberLabel={t('confirmedOrderNumberLabel')}
      body={t('confirmedBody')}
      unstitchedReminder={t('confirmedUnstitchedReminder')}
      backHomeLabel={t('backHome')}
    />
  );
}
