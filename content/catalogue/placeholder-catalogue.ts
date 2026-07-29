/**
 * TEMPORARY placeholder catalogue for /shop and /shop/[id]. Same status as
 * content/catalogue/placeholder-arrivals.ts — there is no real stock/price
 * data source yet (docs/4-architecture.md §3 PRICE_MATRIX / STOCK_ITEM are
 * not built). Replace with a real catalogue query once that exists; the
 * shape here already matches what ProductCard/FabricBlock/JacketBlock/
 * ProductGallery expect, so the swap shouldn't touch page code.
 */
export type Occasion = 'office' | 'everyday' | 'festive' | 'temple';
export type Opacity = 'opaque' | 'semi-sheer' | 'sheer';

export interface CatalogueProduct {
  id: string;
  name: string;
  material: 'plain' | 'super';
  price: number;
  colourName: string;
  colourHex: string;
  occasions: Occasion[];
  opacity: Opacity;
  gsm: number;
  lengthMetres: number;
  jacketMaterialName: string;
  jacketColourName: string;
  jacketSwatchHex: string;
  jacketPieceLengthMetres: number;
  stockState: 'in' | 'low' | 'out';
  quantity?: number;
}

export const placeholderCatalogue: CatalogueProduct[] = [
  {
    id: 'teal-vine',
    name: 'Deep Teal Vine',
    material: 'plain',
    price: 8000,
    colourName: 'Deep teal',
    colourHex: '#1F5C55',
    occasions: ['office', 'everyday'],
    opacity: 'semi-sheer',
    gsm: 120,
    lengthMetres: 5.5,
    jacketMaterialName: 'Gold Brocade',
    jacketColourName: 'Antique gold',
    jacketSwatchHex: '#A07F35',
    jacketPieceLengthMetres: 1.2,
    stockState: 'in',
  },
  {
    id: 'rose-border',
    name: 'Rose Dust Border',
    material: 'super',
    price: 9600,
    colourName: 'Rose dust',
    colourHex: '#C98A8A',
    occasions: ['festive', 'everyday'],
    opacity: 'opaque',
    gsm: 140,
    lengthMetres: 5.5,
    jacketMaterialName: 'Plum Voile',
    jacketColourName: 'Plum',
    jacketSwatchHex: '#5A1E2D',
    jacketPieceLengthMetres: 1.2,
    stockState: 'in',
  },
  {
    id: 'charcoal-medallion',
    name: 'Charcoal Medallion',
    material: 'plain',
    price: 7800,
    colourName: 'Charcoal',
    colourHex: '#33302E',
    occasions: ['office', 'temple'],
    opacity: 'semi-sheer',
    gsm: 118,
    lengthMetres: 5.4,
    jacketMaterialName: 'Ivory Cotton',
    jacketColourName: 'Ivory',
    jacketSwatchHex: '#F2ECE1',
    jacketPieceLengthMetres: 1.1,
    stockState: 'low',
    quantity: 2,
  },
  {
    id: 'marigold-check',
    name: 'Marigold Check',
    material: 'super',
    price: 9100,
    colourName: 'Marigold',
    colourHex: '#D99A2B',
    occasions: ['festive', 'temple'],
    opacity: 'opaque',
    gsm: 145,
    lengthMetres: 5.5,
    jacketMaterialName: 'Charcoal Voile',
    jacketColourName: 'Charcoal',
    jacketSwatchHex: '#33302E',
    jacketPieceLengthMetres: 1.2,
    stockState: 'in',
  },
  {
    id: 'ivory-lattice',
    name: 'Ivory Lattice',
    material: 'plain',
    price: 7900,
    colourName: 'Ivory',
    colourHex: '#F2ECE1',
    occasions: ['office', 'temple'],
    opacity: 'sheer',
    gsm: 110,
    lengthMetres: 5.4,
    jacketMaterialName: 'Marigold Cotton',
    jacketColourName: 'Marigold',
    jacketSwatchHex: '#D99A2B',
    jacketPieceLengthMetres: 1.1,
    stockState: 'in',
  },
  {
    id: 'plum-paisley',
    name: 'Plum Paisley',
    material: 'super',
    price: 9400,
    colourName: 'Plum',
    colourHex: '#5A1E2D',
    occasions: ['festive'],
    opacity: 'opaque',
    gsm: 142,
    lengthMetres: 5.5,
    jacketMaterialName: 'Gold Brocade',
    jacketColourName: 'Antique gold',
    jacketSwatchHex: '#A07F35',
    jacketPieceLengthMetres: 1.2,
    stockState: 'out',
  },
  {
    id: 'sage-stripe',
    name: 'Sage Stripe',
    material: 'plain',
    price: 7600,
    colourName: 'Sage',
    colourHex: '#8A9A7E',
    occasions: ['everyday', 'office'],
    opacity: 'semi-sheer',
    gsm: 115,
    lengthMetres: 5.4,
    jacketMaterialName: 'Ivory Cotton',
    jacketColourName: 'Ivory',
    jacketSwatchHex: '#F2ECE1',
    jacketPieceLengthMetres: 1.1,
    stockState: 'in',
  },
  {
    id: 'indigo-block',
    name: 'Indigo Block Print',
    material: 'super',
    price: 9900,
    colourName: 'Indigo',
    colourHex: '#2B3A67',
    occasions: ['everyday', 'temple'],
    opacity: 'opaque',
    gsm: 148,
    lengthMetres: 5.5,
    jacketMaterialName: 'Ivory Cotton',
    jacketColourName: 'Ivory',
    jacketSwatchHex: '#F2ECE1',
    jacketPieceLengthMetres: 1.2,
    stockState: 'in',
  },
];

export function getCatalogueProduct(id: string): CatalogueProduct | undefined {
  return placeholderCatalogue.find((product) => product.id === id);
}
