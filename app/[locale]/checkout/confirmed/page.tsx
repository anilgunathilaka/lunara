import { getTranslations } from 'next-intl/server';
import { ConfirmedClient } from './ConfirmedClient';

export default async function CheckoutConfirmedPage() {
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
