'use client';

import { useState } from 'react';
import { PreviewCanvas } from '@/components/configurator/PreviewCanvas';
import { HonestyNote } from '@/components/configurator/HonestyNote';
import { DesignPicker } from '@/components/configurator/DesignPicker';
import { MaterialSelector, type MaterialValue } from '@/components/configurator/MaterialSelector';
import { ColourPicker } from '@/components/configurator/ColourPicker';
import { DrapeToggle, type DrapeValue } from '@/components/configurator/DrapeToggle';
import { SuggestedStrip } from '@/components/configurator/SuggestedStrip';
import { ConfiguratorBar } from '@/components/configurator/ConfiguratorBar';
import { FallbackNotice } from '@/components/feedback/FallbackNotice';
import { Button } from '@/components/primitives/Button';
import type { PriceChangeCause } from '@/components/configurator/PriceAttribution';
import {
  devDesigns,
  devPriceMatrix,
  devColours,
  devColourAvailabilityByDesign,
  devJacketDesigns,
  devSuggested,
} from '@/content/dev/configurator-samples';

export interface ConfiguratorQaClientProps {
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
  refreshLabel: string;
  addToCartLabel: string;
  saveLabel: string;
  shareLabel: string;
  requestSwatchesLabel: string;
  fallbackMessage: string;
  simulateFailureLabel: string;
  restoreRendererLabel: string;
}

const FRAME_COUNT = 8;

const DEFAULT_PRICE = { plain: 0, super: 0 };

export function ConfiguratorQaClient(props: ConfiguratorQaClientProps) {
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

  const designPrices = devPriceMatrix[designId] ?? DEFAULT_PRICE;
  const price = designPrices[material];
  const priceDelta = designPrices.super - designPrices.plain;
  const availability = devColourAvailabilityByDesign[designId] ?? {};
  const selectedDesign = devDesigns.find((d) => d.id === designId) ?? devDesigns[0];

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

  // UX-C3: drape switch preserves design, material, colour and jacket — it
  // only changes `drape` itself, nothing else.
  function handleDrapeChange(nextDrape: DrapeValue) {
    setDrape(nextDrape);
    setFrameIndex(0);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
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
        <Button variant="tertiary" size="sm" onClick={() => setRendererBroken((v) => !v)}>
          {rendererBroken ? props.restoreRendererLabel : props.simulateFailureLabel}
        </Button>

        <DrapeToggle
          value={drape}
          onChange={handleDrapeChange}
          sareeLabel={props.sareeLabel}
          osariyaLabel={props.osariyaLabel}
          explainerHref="/dev/configurator"
          explainerLabel={props.explainerLabel}
        />

        <SuggestedStrip
          heading={props.suggestedHeading}
          items={devSuggested.filter((s) => s.id !== designId)}
          onSelect={handleDesignSelect}
          onRefresh={() => {}}
          refreshLabel={props.refreshLabel}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="field-label">Design</h2>
          <DesignPicker
            designs={devDesigns.map((d) => ({ ...d }))}
            selectedDesignId={designId}
            onSelect={handleDesignSelect}
            disabledAnnouncement={props.disabledAnnouncement}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="field-label">Material</h2>
          <MaterialSelector
            value={material}
            onChange={handleMaterialChange}
            plainLabel={props.plainLabel}
            superLabel={props.superLabel}
            priceDelta={priceDelta}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="field-label">Saree colour</h2>
          <ColourPicker
            colours={colourItems}
            selectedColourId={colourId}
            onSelect={setColourId}
            disabledAnnouncement={props.disabledAnnouncement}
            lowStockAnnouncement={props.lowStockAnnouncement}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="field-label">Jacket Design</h2>
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
        onAddToCart={() => {}}
        onSave={() => {}}
        onShare={() => {}}
        onRequestSwatches={() => {}}
        addToCartLabel={props.addToCartLabel}
        saveLabel={props.saveLabel}
        shareLabel={props.shareLabel}
        requestSwatchesLabel={props.requestSwatchesLabel}
      />
    </div>
  );
}
