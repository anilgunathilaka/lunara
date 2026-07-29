import { Bookmark, Share2, Palette } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { PriceAttribution, type PriceChangeCause } from '@/components/configurator/PriceAttribution';

export interface ConfiguratorBarProps {
  price: number;
  previousPrice?: number;
  cause?: PriceChangeCause;
  causeLabel?: string;
  /** false when any current selection is out of stock (UX-C5). */
  canAddToCart: boolean;
  onAddToCart: () => void;
  onSave: () => void;
  onShare: () => void;
  onRequestSwatches: () => void;
  addToCartLabel: string;
  saveLabel: string;
  shareLabel: string;
  requestSwatchesLabel: string;
}

/**
 * docs/3-components.md §4.5 (UX-C10, UX-C12). Pinned to the viewport
 * bottom on mobile with --elev-1 and a 1px top hairline (in globals.css).
 */
export function ConfiguratorBar({
  price,
  previousPrice,
  cause,
  causeLabel,
  canAddToCart,
  onAddToCart,
  onSave,
  onShare,
  onRequestSwatches,
  addToCartLabel,
  saveLabel,
  shareLabel,
  requestSwatchesLabel,
}: ConfiguratorBarProps) {
  return (
    <div className="configurator-bar">
      <div className="configurator-bar-price">
        <PriceDisplay amount={price} />
        <PriceAttribution
          key={`${cause}-${price}`}
          price={price}
          previousPrice={previousPrice}
          cause={cause}
          causeLabel={causeLabel}
        />
      </div>
      <div className="configurator-bar-actions">
        <Button
          variant="tertiary"
          size="sm"
          aria-label={requestSwatchesLabel}
          onClick={onRequestSwatches}
        >
          <Icon icon={Palette} size="inline" />
        </Button>
        <Button variant="tertiary" size="sm" aria-label={saveLabel} onClick={onSave}>
          <Icon icon={Bookmark} size="inline" />
        </Button>
        <Button variant="tertiary" size="sm" aria-label={shareLabel} onClick={onShare}>
          <Icon icon={Share2} size="inline" />
        </Button>
        <Button disabled={!canAddToCart} onClick={onAddToCart}>
          {addToCartLabel}
        </Button>
      </div>
    </div>
  );
}
