'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Button, type ButtonProps } from '@/components/primitives/Button';
import { SlideOver } from '@/components/layout/SlideOver';
import { CartLine } from '@/components/commerce/CartLine';
import { useCart, type CartLineItem } from '@/lib/cart/CartContext';

export interface AddToCartFlowProps {
  item: Omit<CartLineItem, 'id'>;
  addToCartLabel: string;
  addedTitle: string;
  closeLabel: string;
  viewCartLabel: string;
  keepShoppingLabel: string;
  editLabel: string;
  removeLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  unstitchedLabel: string;
  disabled?: boolean;
  size?: ButtonProps['size'];
  fullWidth?: boolean;
}

/**
 * docs/1-ux.md Flow A step 3: "Adding to cart never navigates away from
 * the product. A slide-over confirms and offers 'View cart' or 'Keep
 * shopping'." Shared by the product detail, jacket detail and configurator
 * pages so the confirmation behaves identically everywhere.
 */
export function AddToCartFlow({
  item,
  addToCartLabel,
  addedTitle,
  closeLabel,
  viewCartLabel,
  keepShoppingLabel,
  editLabel,
  removeLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  unstitchedLabel,
  disabled,
  size = 'lg',
  fullWidth = true,
}: AddToCartFlowProps) {
  const { addItem, items, setQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  function handleAdd() {
    const id = addItem(item);
    setAddedId(id);
    setOpen(true);
  }

  const addedLine = items.find((line) => line.id === addedId);

  return (
    <>
      <Button size={size} fullWidth={fullWidth} disabled={disabled} onClick={handleAdd}>
        {addToCartLabel}
      </Button>

      <SlideOver open={open} onClose={() => setOpen(false)} title={addedTitle} closeLabel={closeLabel}>
        <div className="flex flex-col gap-4">
          {addedLine && (
            <CartLine
              thumbnail={addedLine.thumbnail}
              designName={addedLine.designName}
              materialLabel={addedLine.materialLabel}
              sareeColourName={addedLine.sareeColourName ?? ''}
              jacketMaterialName={addedLine.jacketMaterialName}
              jacketColourName={addedLine.jacketColourName ?? ''}
              drapeLabel={addedLine.drapeLabel ?? ''}
              unitPrice={addedLine.unitPrice}
              quantity={addedLine.quantity}
              onQuantityChange={(quantity) => setQuantity(addedLine.id, quantity)}
              onRemove={() => {
                removeItem(addedLine.id);
                setOpen(false);
              }}
              editLabel={editLabel}
              removeLabel={removeLabel}
              decreaseQuantityLabel={decreaseQuantityLabel}
              increaseQuantityLabel={increaseQuantityLabel}
              unstitchedLabel={unstitchedLabel}
            />
          )}
          <div className="flex flex-wrap gap-3">
            <Link href="/cart" className="btn focus-ring btn-primary btn-md">
              {viewCartLabel}
            </Link>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {keepShoppingLabel}
            </Button>
          </div>
        </div>
      </SlideOver>
    </>
  );
}
