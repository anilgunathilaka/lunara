'use client';

import { useState } from 'react';
import { CartLine } from '@/components/commerce/CartLine';
import { CartSummary } from '@/components/commerce/CartSummary';
import { UnstitchedReminder } from '@/components/commerce/UnstitchedReminder';

export interface CartQaClientProps {
  editLabel: string;
  removeLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  unstitchedLabel: string;
  unstitchedMessage: string;
  subtotalLabel: string;
  deliveryFeeLabel: string;
  codFeeLabel: string;
  codWaivedLabel: string;
  totalLabel: string;
  materialPlainLabel: string;
  materialSuperLabel: string;
}

/** Client half of the cart QA page — CartLine's quantity/remove/edit actions need real state. */
export function CartQaClient({
  editLabel,
  removeLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  unstitchedLabel,
  unstitchedMessage,
  subtotalLabel,
  deliveryFeeLabel,
  codFeeLabel,
  codWaivedLabel,
  totalLabel,
  materialPlainLabel,
  materialSuperLabel,
}: CartQaClientProps) {
  const [lines, setLines] = useState([
    {
      id: 'teal',
      designName: 'Deep Teal Vine',
      materialLabel: materialPlainLabel,
      sareeColourName: 'Deep teal',
      jacketMaterialName: 'Gold Brocade',
      jacketColourName: 'Antique gold',
      drapeLabel: 'Saree',
      unitPrice: 8900,
      quantity: 1,
    },
    {
      id: 'rose',
      designName: 'Rose Dust Border',
      materialLabel: materialSuperLabel,
      sareeColourName: 'Rose dust',
      jacketMaterialName: 'Plum Voile',
      jacketColourName: 'Plum',
      drapeLabel: 'Kandyan Osariya',
      unitPrice: 11200,
      quantity: 2,
    },
  ]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFee = 450;
  const codFee = 350;

  return (
    <div className="flex flex-col gap-8">
      <UnstitchedReminder variant="inline" message={unstitchedMessage} />

      <div>
        {lines.map((line) => (
          <CartLine
            key={line.id}
            thumbnail={{ src: '/dev/sample-saree.jpg', alt: `${line.designName}, full drape` }}
            designName={line.designName}
            materialLabel={line.materialLabel}
            sareeColourName={line.sareeColourName}
            jacketMaterialName={line.jacketMaterialName}
            jacketColourName={line.jacketColourName}
            drapeLabel={line.drapeLabel}
            unitPrice={line.unitPrice}
            quantity={line.quantity}
            onQuantityChange={(quantity) =>
              setLines((prev) => prev.map((l) => (l.id === line.id ? { ...l, quantity } : l)))
            }
            onRemove={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
            onEdit={() => {}}
            editLabel={editLabel}
            removeLabel={removeLabel}
            decreaseQuantityLabel={decreaseQuantityLabel}
            increaseQuantityLabel={increaseQuantityLabel}
            unstitchedLabel={unstitchedLabel}
          />
        ))}
      </div>

      <CartSummary
        rows={[
          { label: subtotalLabel, amount: subtotal },
          { label: deliveryFeeLabel, amount: deliveryFee },
          { label: codFeeLabel, amount: codFee, note: codWaivedLabel },
        ]}
        totalLabel={totalLabel}
        total={subtotal + deliveryFee + codFee}
      />
    </div>
  );
}
