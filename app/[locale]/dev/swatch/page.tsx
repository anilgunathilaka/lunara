import { getTranslations } from 'next-intl/server';
import { SwatchChip } from '@/components/product/SwatchChip';
import { devSwatchSamples } from '@/content/dev/swatch-samples';

/**
 * Internal QA scratch page for SwatchChip (docs/3-components.md §3.1). Not
 * part of the shipped product surface — delete or gate behind an env
 * check before launch.
 */
export default async function SwatchQaPage() {
  const t = await getTranslations('product.stock');
  const { teal, rose, ivory, charcoal, marigold } = devSwatchSamples;

  return (
    <main className="mx-auto flex max-w-[600px] flex-col gap-6 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        SwatchChip — QA
      </h1>

      <div className="flex flex-wrap items-center gap-4" role="radiogroup" aria-label="Colour">
        <SwatchChip {...teal} state="default" size="sm" />
        <SwatchChip {...rose} state="default" size="md" />
        <SwatchChip {...ivory} state="selected" size="md" />
        <SwatchChip {...charcoal} state="disabled" size="md" stateAnnouncement={t('outOfStock')} />
        <SwatchChip {...marigold} state="low-stock" size="md" stateAnnouncement={t('lowStock')} />
        <SwatchChip {...teal} state="default" size="lg" />
      </div>

      <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
        Selection ring sits outside the chip; disabled shows a diagonal line at 40% opacity;
        low-stock shows a small gold dot. Colour is never the only signal.
      </p>
    </main>
  );
}
