import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';
import { PriceDisplay } from '@/components/product/PriceDisplay';

export interface CartLineProps {
  /** Thumbnail of the ACTUAL combination — never a generic placeholder. */
  thumbnail: { src: string; alt: string };
  designName: string;
  materialLabel: string;
  /** Omit for a standalone jacket line — there's no saree colour to show. */
  sareeColourName?: string;
  jacketMaterialName: string;
  /** Omit when the jacket has no distinct colour name worth stating separately. */
  jacketColourName?: string;
  /** "Saree" or "Kandyan Osariya" — omit for a standalone jacket line, which has no drape. */
  drapeLabel?: string;
  /** Unit price; the line shows unitPrice × quantity via PriceDisplay. */
  unitPrice: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  /** Present only for a configured (Design Your Own) line. */
  onEdit?: () => void;
  editLabel: string;
  removeLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  /** Already translated "Ships unstitched" — visible on every line carrying a saree. */
  unstitchedLabel: string;
}

export function CartLine({
  thumbnail,
  designName,
  materialLabel,
  sareeColourName,
  jacketMaterialName,
  jacketColourName,
  drapeLabel,
  unitPrice,
  quantity,
  onQuantityChange,
  onRemove,
  onEdit,
  editLabel,
  removeLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  unstitchedLabel,
}: CartLineProps) {
  return (
    <div className="cart-line">
      <div className="cart-line-thumb">
        <Image src={thumbnail.src} alt={thumbnail.alt} fill sizes="96px" />
      </div>

      <div className="cart-line-details">
        <p className="cart-line-name">{designName}</p>
        <p className="cart-line-spec">
          {[
            materialLabel,
            sareeColourName,
            jacketColourName ? `${jacketMaterialName} (${jacketColourName})` : jacketMaterialName,
            drapeLabel,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="jacket-block-unstitched">{unstitchedLabel}</p>

        <div className="cart-line-actions">
          <div className="cart-line-stepper">
            <Button
              variant="tertiary"
              size="sm"
              aria-label={decreaseQuantityLabel}
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(quantity - 1)}
            >
              <Icon icon={Minus} size="inline" />
            </Button>
            <span aria-live="polite" className="cart-line-quantity">
              {quantity}
            </span>
            <Button
              variant="tertiary"
              size="sm"
              aria-label={increaseQuantityLabel}
              onClick={() => onQuantityChange(quantity + 1)}
            >
              <Icon icon={Plus} size="inline" />
            </Button>
          </div>

          {onEdit && (
            <Button variant="tertiary" size="sm" onClick={onEdit}>
              {editLabel}
            </Button>
          )}
          <Button variant="tertiary" size="sm" onClick={onRemove}>
            {removeLabel}
          </Button>
        </div>
      </div>

      <PriceDisplay amount={unitPrice * quantity} className="cart-line-price" />
    </div>
  );
}
