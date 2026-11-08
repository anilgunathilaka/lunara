'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { PreviewCanvas } from '@/components/configurator/PreviewCanvas';
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
import { deltaKey, quoteKey, type ConfiguratorCatalogue } from '@/lib/catalogue/types';
// Colours are still sample data: per-colour stock for every design ×
// material needs the real range (PRD Q1) and arrives with the configurator
// data rebuild. Designs, jackets and prices below are live.
import { devColours } from '@/content/dev/configurator-samples';

export interface DesignYourOwnClientProps {
  /** Designs, jackets and server-resolved prices (docs/4-architecture.md §7.1). */
  catalogue: ConfiguratorCatalogue;
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

const FRAME_COUNT = 8;
const SAVED_DESIGNS_KEY = 'lunara.savedDesigns.v1';

export function DesignYourOwnClient(props: DesignYourOwnClientProps) {
  const { designs, jackets, quotes, materialDeltas } = props.catalogue;
  const { addItem, items, setQuantity, removeItem } = useCart();

  // The page guarantees at least one design and one jacket.
  const [designId, setDesignId] = useState<string>(designs[0]!.id);
  const [material, setMaterial] = useState<MaterialValue>('plain');
  const [colourId, setColourId] = useState('teal');
  const [jacketId, setJacketId] = useState<string>(jackets[0]!.id);
  const [drape, setDrape] = useState<DrapeValue>('saree');
  const [frameIndex, setFrameIndex] = useState(0);
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
  const selectedColour = devColours.find((c) => c.id === colourId);
  const selectedJacket = jackets.find((j) => j.id === jacketId) ?? jackets[0]!;

  const colourItems = devColours.map((c) => ({
    id: c.id,
    colourHex: c.colourHex,
    label: c.label,
    materialName: c.materialName,
    availability: 'available' as const,
  }));

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
    setFrameIndex(0);
  }

  function handleAddToCart() {
    if (price === undefined) return;
    const drapeLabel = drape === 'saree' ? props.sareeLabel : props.osariyaLabel;
    const id = addItem({
      designName: selectedDesign.name,
      materialLabel: material === 'plain' ? props.plainLabel : props.superLabel,
      sareeColourName: selectedColour?.label ?? '',
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
      saved.push({ designId, material, colourId, jacketId, drape, savedAt: Date.now() });
      window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(saved));
    } catch {
      // Storage unavailable — the save simply doesn't persist this session.
    }
    setToastMessage(props.savedToastMessage);
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
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
          <FallbackNotice message={props.fallbackMessage} />
        ) : (
          <PreviewCanvas
            frameUrl={selectedDesign.thumbnailUrl}
            frameAlt={`${selectedDesign.name}, frame ${frameIndex + 1} of ${FRAME_COUNT}`}
            frameCount={FRAME_COUNT}
            frameIndex={frameIndex}
            onRotate={setFrameIndex}
            onRenderFailure={() => setRendererBroken(true)}
            rotateLeftLabel={props.rotateLeftLabel}
            rotateRightLabel={props.rotateRightLabel}
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
            selectedColourId={colourId}
            onSelect={setColourId}
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
      </div>

      <ConfiguratorBar
        price={price ?? 0}
        previousPrice={previousPrice}
        cause={cause}
        causeLabel={causeLabel}
        canAddToCart={price !== undefined && selectedJacket.stockState !== 'out'}
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
