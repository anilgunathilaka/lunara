import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConfiguratorQaClient } from './ConfiguratorQaClient';

/**
 * Internal QA scratch page for the full Wave 5 configurator: SwatchGrid,
 * PreviewCanvas, RotationControl, HonestyNote, DesignPicker,
 * MaterialSelector, ColourPicker, PriceAttribution, DrapeToggle,
 * SuggestedStrip, ConfiguratorBar and FallbackNotice
 * (docs/3-components.md §4). Not part of the shipped product surface —
 * delete or gate behind an env check before launch.
 *
 * PreviewCanvas here displays a static placeholder regardless of
 * selection — there is no real photography or server-side compositor
 * yet (docs/4-architecture.md §5). The "Simulate renderer failure"
 * button demonstrates the FallbackNotice degradation path (UX-C9).
 */
export default async function ConfiguratorQaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tFabric = await getTranslations('product.fabric');
  const tStock = await getTranslations('product.stock');
  const tDrape = await getTranslations('configurator.drape');
  const tRotation = await getTranslations('configurator.rotation');
  const tHonesty = await getTranslations('configurator.honesty');
  const tSuggested = await getTranslations('configurator.suggested');
  const tBar = await getTranslations('configurator.bar');
  const tFallback = await getTranslations('feedback.fallback');
  const tDevOnly = await getTranslations('configurator.devOnly');

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Configurator — QA
      </h1>
      <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
        Try changing design (colour is preserved when available), material (price updates with
        attribution), and drape (nothing else resets). Charcoal/Rose/Teal show disabled or
        low-stock colours depending on the selected design.
      </p>

      <ConfiguratorQaClient
        plainLabel={tFabric('materialPlain')}
        superLabel={tFabric('materialSuper')}
        sareeLabel={tDrape('saree')}
        osariyaLabel={tDrape('osariya')}
        explainerLabel={tDrape('explainer')}
        disabledAnnouncement={tStock('outOfStock')}
        lowStockAnnouncement={tStock('lowStock')}
        rotateLeftLabel={tRotation('left')}
        rotateRightLabel={tRotation('right')}
        honestyNoteText={tHonesty('text')}
        seeSareePhotosLabel={tHonesty('seeSaree')}
        seeJacketPhotosLabel={tHonesty('seeJacket')}
        suggestedHeading={tSuggested('heading')}
        refreshLabel={tSuggested('refresh')}
        addToCartLabel={tBar('addToCart')}
        saveLabel={tBar('save')}
        shareLabel={tBar('share')}
        requestSwatchesLabel={tBar('requestSwatches')}
        fallbackMessage={tFallback('rendererFailed')}
        simulateFailureLabel={tDevOnly('simulateFailure')}
        restoreRendererLabel={tDevOnly('restoreRenderer')}
      />
    </main>
  );
}
