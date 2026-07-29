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
import {
  devDesigns,
  devPriceMatrix,
  devColours,
  devColourAvailabilityByDesign,
  devJacketDesigns,
  devSuggested,
} from '@/content/dev/configurator-samples';

export interface DesignYourOwnClientProps {
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
const DEFAULT_PRICE = { plain: 0, super: 0 };
const SAVED_DESIGNS_KEY = 'lunara.savedDesigns.v1';

export function DesignYourOwnClient(props: DesignYourOwnClientProps) {
  const { addItem, items, setQuantity, removeItem } = useCart();

  const [designId, setDesignId] = useState<string>(devDesigns[0].id);
  const [material, setMaterial] = useState<MaterialValue>('plain');
  const [colourId, setColourId] = useState('teal');
  const [jacketDesignId, setJacketDesignId] = useState<string>(devJacketDesigns[0].id);
  const [drape, setDrape] = useState<DrapeValue>('saree');
  const [frameIndex, setFrameIndex] = useState(0);
  const [rendererBroken, setRendererBroken] = useState(false);

  const [previousPrice, setPreviousPrice] = useState<number>();
  const [cause, setCause] = useState<PriceChangeCause>();
  const [causeLabel, setCauseLabel] = useState<string>();

  const [addedOpen, setAddedOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const designPrices = devPriceMatrix[designId] ?? DEFAULT_PRICE;
  const price = designPrices[material];
  const priceDelta = designPrices.super - designPrices.plain;
  const availability = devColourAvailabilityByDesign[designId] ?? {};
  const selectedDesign = devDesigns.find((d) => d.id === designId) ?? devDesigns[0];
  const selectedColour = devColours.find((c) => c.id === colourId);
  const selectedJacket = devJacketDesigns.find((j) => j.id === jacketDesignId) ?? devJacketDesigns[0];

  const colourItems = devColours.map((c) => ({
    id: c.id,
    colourHex: c.colourHex,
    label: c.label,
    materialName: c.materialName,
    availability: availability[c.id] ?? 'available',
  }));

  function handleDesignSelect(nextDesignId: string) {
    setPreviousPrice(price);
    setCause('design');
    setCauseLabel(devDesigns.find((d) => d.id === nextDesignId)?.name);
    setDesignId(nextDesignId);

    // UX-C1b: preserve the current colour where it's available for the new design.
    const nextAvailability = devColourAvailabilityByDesign[nextDesignId] ?? {};
    if (nextAvailability[colourId] === 'disabled') {
      const firstAvailable = Object.entries(nextAvailability).find(([, v]) => v !== 'disabled')?.[0];
      if (firstAvailable) setColourId(firstAvailable);
    }
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
    const drapeLabel = drape === 'saree' ? props.sareeLabel : props.osariyaLabel;
    const id = addItem({
      designName: selectedDesign.name,
      materialLabel: material === 'plain' ? props.plainLabel : props.superLabel,
      sareeColourName: selectedColour?.label ?? '',
      jacketMaterialName: selectedJacket.name,
      jacketColourName: '',
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
      saved.push({ designId, material, colourId, jacketDesignId, drape, savedAt: Date.now() });
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
          items={devSuggested.filter((s) => s.id !== designId)}
          onSelect={handleDesignSelect}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="field-label">{props.designHeading}</h2>
          <DesignPicker
            designs={devDesigns.map((d) => ({ ...d }))}
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
          <DesignPicker
            designs={devJacketDesigns.map((d) => ({ ...d }))}
            selectedDesignId={jacketDesignId}
            onSelect={setJacketDesignId}
            disabledAnnouncement={props.disabledAnnouncement}
          />
        </div>
      </div>

      <ConfiguratorBar
        price={price}
        previousPrice={previousPrice}
        cause={cause}
        causeLabel={causeLabel}
        canAddToCart={availability[colourId] !== 'disabled'}
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
