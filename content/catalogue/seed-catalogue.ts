/**
 * PLACEHOLDER catalogue loaded into Postgres by prisma/seed.ts
 * (docs/4-architecture.md §3.3). Sample data, not real inventory: names,
 * prices, colours and stock are stand-ins until the real range is confirmed
 * (PRD Q1, Q1a, Q3, Q5). Replace this data — not the seed mechanism — when
 * real products exist.
 *
 * Lives under content/ because colour hex values are product data, not
 * styling (the token lint ignores content/).
 *
 * Prices are whole LKR. Customer price = matrix price + jacket pairing
 * add-on (all add-ons are 0 here, so listings keep their earlier prices).
 */

export type SeedOccasion = 'office' | 'everyday' | 'festive' | 'temple';
export type SeedOpacity = 'opaque' | 'semi_sheer' | 'sheer';
export type SeedMaterialId = 'plain' | 'super';

export interface SeedMaterial {
  id: SeedMaterialId;
  name: string;
  gsm: number;
  opacity: SeedOpacity;
  lengthMetres: string;
}

export interface SeedDesign {
  id: string;
  name: string;
  occasionTags: SeedOccasion[];
  prices: Record<SeedMaterialId, number>;
}

export interface SeedSareeColourway {
  id: string;
  designId: string;
  materialId: SeedMaterialId;
  colourName: string;
  colourHex: string;
  sku: string;
  quantity: number;
}

export interface SeedJacketMaterial {
  id: string;
  name: string;
  composition: string;
  pieceLengthMetres: string;
  pairingAddOn: number;
  standalonePrice: number;
}

export interface SeedJacketColourway {
  id: string;
  materialId: string;
  colourName: string;
  colourHex: string;
  sku: string;
  quantity: number;
}

export interface SeedListing {
  id: string;
  name: string;
  sareeColourwayId: string;
  jacketColourwayId: string;
  isFeatured: boolean;
}

export const PLACEHOLDER_LOT = 'PLACEHOLDER-LOT';
export const DEFAULT_THRESHOLD = 3;

export const seedMaterials: SeedMaterial[] = [
  { id: 'plain', name: 'Plain Cotton', gsm: 118, opacity: 'semi_sheer', lengthMetres: '5.40' },
  { id: 'super', name: 'Super Cotton', gsm: 145, opacity: 'opaque', lengthMetres: '5.50' },
];

export const seedDesigns: SeedDesign[] = [
  { id: 'vine', name: 'Vine', occasionTags: ['office', 'everyday'], prices: { plain: 8000, super: 8900 } },
  { id: 'border', name: 'Border', occasionTags: ['festive', 'everyday'], prices: { plain: 8500, super: 9600 } },
  { id: 'medallion', name: 'Medallion', occasionTags: ['office', 'temple'], prices: { plain: 7800, super: 8700 } },
  { id: 'check', name: 'Check', occasionTags: ['festive', 'temple'], prices: { plain: 8200, super: 9100 } },
  { id: 'lattice', name: 'Lattice', occasionTags: ['office', 'temple'], prices: { plain: 7900, super: 8800 } },
  { id: 'paisley', name: 'Paisley', occasionTags: ['festive'], prices: { plain: 8500, super: 9400 } },
  { id: 'stripe', name: 'Stripe', occasionTags: ['everyday', 'office'], prices: { plain: 7600, super: 8500 } },
  { id: 'block-print', name: 'Block Print', occasionTags: ['everyday', 'temple'], prices: { plain: 9000, super: 9900 } },
];

export const seedSareeColourways: SeedSareeColourway[] = [
  { id: 'vine-plain-deep-teal', designId: 'vine', materialId: 'plain', colourName: 'Deep teal', colourHex: '#1F5C55', sku: 'SAR-VINE-PLN-TEAL', quantity: 12 },
  { id: 'border-super-rose-dust', designId: 'border', materialId: 'super', colourName: 'Rose dust', colourHex: '#C98A8A', sku: 'SAR-BORDER-SUP-ROSE', quantity: 12 },
  { id: 'medallion-plain-charcoal', designId: 'medallion', materialId: 'plain', colourName: 'Charcoal', colourHex: '#33302E', sku: 'SAR-MEDAL-PLN-CHAR', quantity: 2 },
  { id: 'check-super-marigold', designId: 'check', materialId: 'super', colourName: 'Marigold', colourHex: '#D99A2B', sku: 'SAR-CHECK-SUP-MARI', quantity: 12 },
  { id: 'lattice-plain-ivory', designId: 'lattice', materialId: 'plain', colourName: 'Ivory', colourHex: '#F2ECE1', sku: 'SAR-LATT-PLN-IVORY', quantity: 12 },
  { id: 'paisley-super-plum', designId: 'paisley', materialId: 'super', colourName: 'Plum', colourHex: '#5A1E2D', sku: 'SAR-PAIS-SUP-PLUM', quantity: 0 },
  { id: 'stripe-plain-sage', designId: 'stripe', materialId: 'plain', colourName: 'Sage', colourHex: '#8A9A7E', sku: 'SAR-STRIPE-PLN-SAGE', quantity: 12 },
  { id: 'block-print-super-indigo', designId: 'block-print', materialId: 'super', colourName: 'Indigo', colourHex: '#2B3A67', sku: 'SAR-BLOCK-SUP-INDIGO', quantity: 12 },
];

export const seedJacketMaterials: SeedJacketMaterial[] = [
  { id: 'gold-brocade', name: 'Gold Brocade', composition: '100% cotton brocade', pieceLengthMetres: '1.20', pairingAddOn: 0, standalonePrice: 1800 },
  { id: 'plum-voile', name: 'Plum Voile', composition: '100% cotton voile', pieceLengthMetres: '1.20', pairingAddOn: 0, standalonePrice: 1500 },
  { id: 'ivory-cotton', name: 'Ivory Cotton', composition: '100% plain cotton', pieceLengthMetres: '1.10', pairingAddOn: 0, standalonePrice: 1200 },
  { id: 'charcoal-voile', name: 'Charcoal Voile', composition: '100% cotton voile', pieceLengthMetres: '1.20', pairingAddOn: 0, standalonePrice: 1500 },
  { id: 'marigold-cotton', name: 'Marigold Cotton', composition: '100% plain cotton', pieceLengthMetres: '1.10', pairingAddOn: 0, standalonePrice: 1200 },
];

/** Colourway ids keep the old /jacket-material/[id] URLs working. */
export const seedJacketColourways: SeedJacketColourway[] = [
  { id: 'gold-brocade-antique', materialId: 'gold-brocade', colourName: 'Antique gold', colourHex: '#A07F35', sku: 'JKT-BROCADE-GOLD', quantity: 15 },
  { id: 'plum-voile', materialId: 'plum-voile', colourName: 'Plum', colourHex: '#5A1E2D', sku: 'JKT-VOILE-PLUM', quantity: 15 },
  { id: 'ivory-cotton', materialId: 'ivory-cotton', colourName: 'Ivory', colourHex: '#F2ECE1', sku: 'JKT-COTTON-IVORY', quantity: 3 },
  { id: 'charcoal-voile', materialId: 'charcoal-voile', colourName: 'Charcoal', colourHex: '#33302E', sku: 'JKT-VOILE-CHAR', quantity: 15 },
  { id: 'marigold-cotton', materialId: 'marigold-cotton', colourName: 'Marigold', colourHex: '#D99A2B', sku: 'JKT-COTTON-MARI', quantity: 15 },
];

/** Listing ids keep the old /shop/[id] URLs working. Order = display order. */
export const seedListings: SeedListing[] = [
  { id: 'teal-vine', name: 'Deep Teal Vine', sareeColourwayId: 'vine-plain-deep-teal', jacketColourwayId: 'gold-brocade-antique', isFeatured: true },
  { id: 'rose-border', name: 'Rose Dust Border', sareeColourwayId: 'border-super-rose-dust', jacketColourwayId: 'plum-voile', isFeatured: true },
  { id: 'charcoal-medallion', name: 'Charcoal Medallion', sareeColourwayId: 'medallion-plain-charcoal', jacketColourwayId: 'ivory-cotton', isFeatured: true },
  { id: 'marigold-check', name: 'Marigold Check', sareeColourwayId: 'check-super-marigold', jacketColourwayId: 'charcoal-voile', isFeatured: true },
  { id: 'ivory-lattice', name: 'Ivory Lattice', sareeColourwayId: 'lattice-plain-ivory', jacketColourwayId: 'marigold-cotton', isFeatured: true },
  { id: 'plum-paisley', name: 'Plum Paisley', sareeColourwayId: 'paisley-super-plum', jacketColourwayId: 'gold-brocade-antique', isFeatured: true },
  { id: 'sage-stripe', name: 'Sage Stripe', sareeColourwayId: 'stripe-plain-sage', jacketColourwayId: 'ivory-cotton', isFeatured: false },
  { id: 'indigo-block', name: 'Indigo Block Print', sareeColourwayId: 'block-print-super-indigo', jacketColourwayId: 'ivory-cotton', isFeatured: false },
];
