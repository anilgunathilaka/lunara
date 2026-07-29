import { getTranslations } from 'next-intl/server';
import { CartQaClient } from './CartQaClient';

/**
 * Internal QA scratch page for CartLine, CartSummary and the inline
 * UnstitchedReminder (docs/3-components.md §5.1, §5.2). Not part of the
 * shipped product surface — delete or gate behind an env check before
 * launch.
 */
export default async function CartQaPage() {
  const tCart = await getTranslations('commerce.cart');
  const tSummary = await getTranslations('commerce.summary');
  const tUnstitched = await getTranslations('commerce.unstitched');
  const tFabric = await getTranslations('product.fabric');
  const tJacket = await getTranslations('product.jacket');

  return (
    <main className="mx-auto flex max-w-[600px] flex-col gap-8 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Cart — QA
      </h1>

      <CartQaClient
        editLabel={tCart('editDesign')}
        removeLabel={tCart('remove')}
        decreaseQuantityLabel={tCart('decreaseQuantity')}
        increaseQuantityLabel={tCart('increaseQuantity')}
        unstitchedLabel={tJacket('shipsUnstitched')}
        unstitchedMessage={tUnstitched('message')}
        subtotalLabel={tSummary('subtotal')}
        deliveryFeeLabel={tSummary('deliveryFee')}
        codFeeLabel={tSummary('codFee')}
        codWaivedLabel={tSummary('codWaived')}
        totalLabel={tSummary('total')}
        materialPlainLabel={tFabric('materialPlain')}
        materialSuperLabel={tFabric('materialSuper')}
      />
    </main>
  );
}
