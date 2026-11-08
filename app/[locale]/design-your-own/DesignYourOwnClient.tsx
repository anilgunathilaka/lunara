'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HonestyNote } from '@/components/configurator/HonestyNote';
import { DesignPicker } from '@/components/configurator/DesignPicker';
import { MaterialSelector, type MaterialValue } from '@/components/configurator/MaterialSelector';
import { ColourPicker } from '@/components/configurator/ColourPicker';
import { DrapeToggle, type DrapeValue } from '@/components/configurator/DrapeToggle';
import { SuggestedStrip } from '@/components/configurator/SuggestedStrip';
import { ConfiguratorBar } from '@/components/configurator/ConfiguratorBar';
import { FallbackNotice } from '@/components/feedback/FallbackNotice';
import { CartLine } from '@/components/commerce/CartLine';
import { Toast } from '@/components/feedback/Toast';
import { Button } from '@/components/primitives/Button';
import { SlideOver } from '@/components/layout/SlideOver';
import { useCart } from '@/lib/cart/CartContext';
import type { PriceChangeCause } from '@/components/configurator/PriceAttribution';
import { colourwayKey, deltaKey, quoteKey, type ConfiguratorCatalogue } from '@/lib/catalogue/types';

// The 3D library loads only here, after the page is interactive (docs/4-architecture.md §5.0).
const ConfiguratorViewer = dynamic(
  () => import('@/components/configurator/ConfiguratorViewer').then((m) => m.ConfiguratorViewer),
  { ssr: false },
);

/** A starting selection, e.g. from a shared link (UX-C12). Every field is checked against the catalogue. */
export interface InitialSelection {
  designId?: string;
  material?: MaterialValue;
  colourName?: string;
  jacketId?: string;
  drape?: DrapeValue;
}

export interface DesignYourOwnClientProps {
  /** Designs, colours, jackets, stock and server-resolved prices (docs/4-architecture.md §7.1). */
  catalogue: ConfiguratorCatalogue;
  initial: InitialSelection;
  /** A real .glb once one exists; null shows the built-in figure (lib/configurator/model.ts). */
  modelUrl: string | null;
  plainLabel: string;
  superLabel: string;
  sareeLabel: string;
  osariyaLabel: string;
  explainerLabel: string;
  disabledAnnouncement: string;
  lowStockAnnouncement: string;
  rotateLeftLabel: string;
  rotateRightLabel: string;
  honestyNoteText: string;
  seeSareePhotosLabel: string;
  seeJacketPhotosLabel: string;
  suggestedHeading: string;
  addToCartLabel: string;
  saveLabel: string;
  shareLabel: string;
  requestSwatchesLabel: string;
  fallbackMessage: string;
  designHeading: string;
  materialHeading: string;
  colourHeading: string;
  jacketHeading: string;
  addedTitle: string;
  closeLabel: string;
  viewCartLabel: string;
  keepShoppingLabel: string;
  editLabel: string;
  removeLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  unstitchedLabel: string;
  savedToastMessage: string;
  sharedToastMessage: string;
  swatchesToastMessage: string;
}

const SAVED_DESIGNS_KEY = 'lunara.savedDesigns.v1';

/** Opens on a combination that can actually be bought, unless a shared link asks for another (UX-C1). */
function startingSelection(catalogue: ConfiguratorCatalogue, initial: InitialSelection) {
  const { designs, jackets, colours, colourways } = catalogue;
  let designId = designs[0]!.id;
  let material: MaterialValue = 'plain';
  let colourName = colours[0]?.name ?? '';
  search: for (const design of designs) {
    for (const m of ['plain', 'super'] as const) {
      const stocked = colourways[colourwayKey(design.id, m)]?.find((c) => c.stockState !== 'out');
      if (stocked) {
        designId = design.id;
        material = m;
        colourName = stocked.colourName;
        break search;
      }
    }
  }
  return {
    designId: designs.some((d) => d.id === initial.designId) ? initial.designId! : designId,
    material: initial.material ?? material,
    colourName: colours.some((c) => c.name === initial.colourName) ? initial.colourName! : colourName,
    jacketId: jackets.some((j) => j.id === initial.jacketId)
      ? initial.jacketId!
      : (jackets.find((j) => j.stockState !== 'out') ?? jackets[0]!).id,
    drape: initial.drape ?? ('saree' as DrapeValue),
  };
}

export function DesignYourOwnClient(props: DesignYourOwnClientProps) {
  const { designs, jackets, colours, colourways, quotes, materialDeltas } = props.catalogue;
  const { addItem, items, setQuantity, removeItem } = useCart();
  const t = useTranslations('configurator.viewer');

  // The page guarantees at least one design and one jacket.
  const [start] = useState(() => startingSelection(props.catalogue, props.initial));
  const [designId, setDesignId] = useState<string>(start.designId);
  const [material, setMaterial] = useState<MaterialValue>(start.material);
  const [colourName, setColourName] = useState(start.colourName);
  const [jacketId, setJacketId] = useState<string>(start.jacketId);
  const [drape, setDrape] = useState<DrapeValue>(start.drape);
  const [rendererBroken, setRendererBroken] = useState(false);

  const [previousPrice, setPreviousPrice] = useState<number>();
  const [cause, setCause] = useState<PriceChangeCause>();
  const [causeLabel, setCauseLabel] = useState<string>();

  const [addedOpen, setAddedOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Looked up, never computed: every price was resolved on the server.
  const price = quotes[quoteKey(designId, material, jacketId)];
  const priceDelta = materialDeltas[deltaKey(designId, jacketId)] ?? 0;
  const selectedDesign = designs.find((d) => d.id === designId) ?? designs[0]!;
  const selectedColour = colours.find((c) => c.name === colourName) ?? colours[0];
  const selectedJacket = jackets.find((j) => j.id === jacketId) ?? jackets[0]!;
  const materialLabel = material === 'plain' ? props.plainLabel : props.superLabel;

  // Buyable only as a stocked colourway (docs/4-architecture.md §5.0); every
  // colour still shows, unavailable ones disabled, never hidden (UX-C5).
  const stocked = colourways[colourwayKey(designId, material)] ?? [];
  const colourway = stocked.find((c) => c.colourName === colourName);
  const colourItems = colours.map((c) => {
    const row = stocked.find((x) => x.colourName === c.name);
    const availability: 'available' | 'disabled' | 'low-stock' =
      !row || row.stockState === 'out' ? 'disabled' : row.stockState === 'low' ? 'low-stock' : 'available';
    return { id: c.name, colourHex: c.hex, label: c.name, materialName: materialLabel, availability };
  });
  const buyable =
    price !== undefined && !!colourway && colourway.stockState !== 'out' && selectedJacket.stockState !== 'out';
  const drapeLabel = drape === 'saree' ? props.sareeLabel : props.osariyaLabel;
  const viewerLabel = t('label', {
    design: selectedDesign.name,
    colour: selectedColour?.name ?? '',
    material: materialLabel,
    jacket: selectedJacket.name,
    drape: drapeLabel,
  });

  const jacketOptions = jackets.map((j) => ({
    id: j.id,
    name: j.name,
    thumbnailUrl: j.thumbnailUrl,
    disabled: j.stockState === 'out',
  }));

  function handleDesignSelect(nextDesignId: string) {
    setPreviousPrice(price);
    setCause('design');
    setCauseLabel(designs.find((d) => d.id === nextDesignId)?.name);
    setDesignId(nextDesignId);
  }

  function handleJacketSelect(nextJacketId: string) {
    setPreviousPrice(price);
    setCause('jacket');
    setCauseLabel(jackets.find((j) => j.id === nextJacketId)?.name);
    setJacketId(nextJacketId);
  }

  function handleMaterialChange(nextMaterial: MaterialValue) {
    setPreviousPrice(price);
    setCause('material');
    setCauseLabel(nextMaterial === 'super' ? props.superLabel : props.plainLabel);
    setMaterial(nextMaterial);
  }

  // UX-C3: drape switch preserves design, material, colour and jacket.
  function handleDrapeChange(nextDrape: DrapeValue) {
    setDrape(nextDrape);
  }

  function handleAddToCart() {
    if (price === undefined || !buyable) return;
    const id = addItem({
      // The server re-checks that this is a real, stocked colourway and prices it.
      ref: {
        kind: 'configured',
        designId,
        materialId: material,
        colourName,
        jacketColourwayId: jacketId,
        drape,
      },
      designName: selectedDesign.name,
      materialLabel,
      sareeColourName: colourName,
      jacketMaterialName: selectedJacket.materialName,
      jacketColourName: selectedJacket.colourName,
      drapeLabel,
      unitPrice: price,
      quantity: 1,
      thumbnail: { src: selectedDesign.thumbnailUrl, alt: selectedDesign.name },
      editHref: '/design-your-own',
      unstitched: true,
    });
    setAddedId(id);
    setAddedOpen(true);
  }

  function handleSave() {
    try {
      const raw = window.localStorage.getItem(SAVED_DESIGNS_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      saved.push({ designId, material, colourName, jacketId, drape, savedAt: Date.now() });
      window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(saved));
    } catch {
      // Storage unavailable — the save simply doesn't persist this session.
    }
    setToastMessage(props.savedToastMessage);
  }

  /** The link reopens this exact combination (UX-C12), no account needed. */
  function shareUrl(): string {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ d: designId, m: material, c: colourName, j: jacketId, dr: drape }).toString();
    return url.toString();
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareUrl());
    } catch {
      // Clipboard unavailable — the toast still confirms the intent.
    }
    setToastMessage(props.sharedToastMessage);
  }

  function handleRequestSwatches() {
    setToastMessage(props.swatchesToastMessage);
  }

  const addedLine = items.find((line) => line.id === addedId);

  return (
    <div className="flex flex-col gap-6 pb-24 lg:flex-row lg:items-start lg:pb-0">
      <div className="flex flex-1 flex-col gap-3">
        {rendererBroken ? (
          // Degrades, never blocks (§5.4): every picker and the cart keep working.
          <>
            <FallbackNotice message={props.fallbackMessage} />
            <div className="preview-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element -- static fallback image */}
              <img src={selectedDesign.thumbnailUrl} alt={viewerLabel} className="preview-canvas-frame" />
            </div>
          </>
        ) : (
          <ConfiguratorViewer
            selection={{
              designId,
              patternUrl: selectedDesign.patternUrl,
              sareeHex: selectedColour?.hex ?? '',
              material,
              jacketHex: selectedJacket.swatchHex,
              jacketTextureUrl: selectedJacket.textureUrl,
              drape,
            }}
            modelUrl={props.modelUrl}
            label={viewerLabel}
            loadingLabel={t('loading')}
            rotateLeftLabel={props.rotateLeftLabel}
            rotateRightLabel={props.rotateRightLabel}
            onFailure={() => setRendererBroken(true)}
          />
        )}
        <HonestyNote
          content={
            <>
              {props.honestyNoteText} <a href="#saree-ref">{props.seeSareePhotosLabel}</a> ·{' '}
              <a href="#jacket-ref">{props.seeJacketPhotosLabel}</a>
            </>
          }
        />

        <DrapeToggle
          value={drape}
          onChange={handleDrapeChange}
          sareeLabel={props.sareeLabel}
          osariyaLabel={props.osariyaLabel}
          explainerHref="/support"
          explainerLabel={props.explainerLabel}
        />

        <SuggestedStrip
          heading={props.suggestedHeading}
          items={designs.filter((d) => d.id !== designId).slice(0, 3)}
          onSelect={handleDesignSelect}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="field-label">{props.designHeading}</h2>
          <DesignPicker
            designs={designs}
            selectedDesignId={designId}
            onSelect={handleDesignSelect}
            disabledAnnouncement={props.disabledAnnouncement}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="field-label">{props.materialHeading}</h2>
          <MaterialSelector
            value={material}
            onChange={handleMaterialChange}
            plainLabel={props.plainLabel}
            superLabel={props.superLabel}
            priceDelta={priceDelta}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="field-label">{props.colourHeading}</h2>
          <ColourPicker
            colours={colourItems}
            selectedColourId={colourName}
            onSelect={setColourName}
            disabledAnnouncement={props.disabledAnnouncement}
            lowStockAnnouncement={props.lowStockAnnouncement}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="field-label">{props.jacketHeading}</h2>
          {/* Jacket MATERIAL + colour, sold unstitched — never a blouse style
              (CLAUDE.md: we do not stitch). */}
          <DesignPicker
            designs={jacketOptions}
            selectedDesignId={jacketId}
            onSelect={handleJacketSelect}
            disabledAnnouncement={props.disabledAnnouncement}
          />
        </div>

        {!buyable && (
          // Says why, beside the choices, rather than a silently disabled button.
          <p className="field-message" role="status">
            {colourway?.stockState === 'out' || selectedJacket.stockState === 'out'
              ? t('outOfStock')
              : t('notOffered', { colour: colourName, material: materialLabel })}
          </p>
        )}
      </div>

      <ConfiguratorBar
        price={price ?? 0}
        previousPrice={previousPrice}
        cause={cause}
        causeLabel={causeLabel}
        canAddToCart={buyable}
        onAddToCart={handleAddToCart}
        onSave={handleSave}
        onShare={handleShare}
        onRequestSwatches={handleRequestSwatches}
        addToCartLabel={props.addToCartLabel}
        saveLabel={props.saveLabel}
        shareLabel={props.shareLabel}
        requestSwatchesLabel={props.requestSwatchesLabel}
      />

      <SlideOver open={addedOpen} onClose={() => setAddedOpen(false)} title={props.addedTitle} closeLabel={props.closeLabel}>
        <div className="flex flex-col gap-4">
          {addedLine && (
            <CartLine
              thumbnail={addedLine.thumbnail}
              designName={addedLine.designName}
              materialLabel={addedLine.materialLabel}
              sareeColourName={addedLine.sareeColourName}
              jacketMaterialName={addedLine.jacketMaterialName}
              jacketColourName={addedLine.jacketColourName}
              drapeLabel={addedLine.drapeLabel}
              unitPrice={addedLine.unitPrice}
              quantity={addedLine.quantity}
              onQuantityChange={(quantity) => setQuantity(addedLine.id, quantity)}
              onRemove={() => {
                removeItem(addedLine.id);
                setAddedOpen(false);
              }}
              editLabel={props.editLabel}
              removeLabel={props.removeLabel}
              decreaseQuantityLabel={props.decreaseQuantityLabel}
              increaseQuantityLabel={props.increaseQuantityLabel}
              unstitchedLabel={props.unstitchedLabel}
            />
          )}
          <div className="flex flex-wrap gap-3">
            <Link href="/cart" className="btn focus-ring btn-primary btn-md">
              {props.viewCartLabel}
            </Link>
            <Button variant="secondary" onClick={() => setAddedOpen(false)}>
              {props.keepShoppingLabel}
            </Button>
          </div>
        </div>
      </SlideOver>

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
