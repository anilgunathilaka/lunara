/**
 * Sample catalogue data for the app/[locale]/dev/catalogue QA page. Not
 * shipped product content — real designs, prices and swatch colours come
 * from the catalogue data source (Prisma / STOCK_ITEM), never hardcoded
 * in a component or page.
 *
 * Lives in content/ (excluded from `npm run lint:tokens`) because these
 * hex values are sampled-fabric catalogue data, not design-system tokens.
 */
export const devCatalogueSamples = {
  cards: [
    {
      name: 'Deep Teal Vine — Plain Cotton',
      price: 8900,
      jacketMaterialName: 'Gold Brocade',
      jacketSwatchHex: '#A07F35',
      stockState: 'in',
    },
    {
      name: 'Rose Dust Border — Super Cotton',
      price: 11200,
      jacketMaterialName: 'Plum Voile',
      jacketSwatchHex: '#5A1E2D',
      stockState: 'low',
      quantity: 2,
    },
    {
      name: 'Charcoal Medallion — Plain Cotton',
      price: 8500,
      jacketMaterialName: 'Ivory Cotton',
      jacketSwatchHex: '#F2ECE1',
      stockState: 'out',
    },
  ],
  jacketBlock: {
    materialName: 'Gold Brocade',
    swatchHex: '#A07F35',
  },
} as const;
