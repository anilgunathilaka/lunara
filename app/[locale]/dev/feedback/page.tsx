import { getTranslations } from 'next-intl/server';
import { FeedbackQaClient } from './FeedbackQaClient';

/**
 * Internal QA scratch page for Toast, InlineError, EmptyState and
 * LoadingSkeleton (docs/3-components.md §6.1). Not part of the shipped
 * product surface — delete or gate behind an env check before launch.
 */
export default async function FeedbackQaPage() {
  const tToast = await getTranslations('feedback.toast');
  const tEmpty = await getTranslations('feedback.emptyState');

  return (
    <main className="mx-auto flex max-w-[500px] flex-col gap-4 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Feedback components — QA
      </h1>

      <FeedbackQaClient
        toastAdded={tToast('added')}
        toastRemoved={tToast('removed')}
        toastUndo={tToast('undo')}
        inlineErrorExample="Enter a 10-digit phone number"
        emptyCartMessage={tEmpty('cartEmpty')}
        shopCuratedLabel={tEmpty('shopCurated')}
        designYourOwnLabel={tEmpty('designYourOwn')}
      />
    </main>
  );
}
