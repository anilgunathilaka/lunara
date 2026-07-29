/**
 * Mock catalogue data for the app/[locale]/dev/configurator QA page. Not
 * shipped product content. thumbnailUrl/frameUrl all point at the same
 * placeholder image since there's no real photography or server-side
 * compositor yet (docs/4-architecture.md §5) — the interaction contracts
 * (colour-specific thumbnails, per-frame compositor output) are modelled
 * correctly even though the demo image itself doesn't actually change.
 */

const PLACEHOLDER = '/dev/sample-saree.jpg';

export const devDesigns = [
  { id: 'teal-vine', name: 'Deep Teal Vine', thumbnailUrl: PLACEHOLDER },
  { id: 'rose-border', name: 'Rose Dust Border', thumbnailUrl: PLACEHOLDER },
  { id: 'charcoal-medallion', name: 'Charcoal Medallion', thumbnailUrl: PLACEHOLDER },
  { id: 'marigold-check', name: 'Marigold Check', thumbnailUrl: PLACEHOLDER },
] as const;

// docs/4-architecture.md §7.1 — PRICE_MATRIX[design][material]. In
// production this is resolved server-side ONLY; never computed client-side.
export const devPriceMatrix: Record<string, { plain: number; super: number }> = {
  'teal-vine': { plain: 8000, super: 8900 },
  'rose-border': { plain: 8500, super: 9600 },
  'charcoal-medallion': { plain: 7800, super: 8700 },
  'marigold-check': { plain: 8200, super: 9100 },
};

export const devColours = [
  { id: 'teal', label: 'Deep teal', colourHex: '#1F5C55', materialName: 'Voile' },
  { id: 'rose', label: 'Rose dust', colourHex: '#C98A8A', materialName: 'Voile' },
  { id: 'ivory', label: 'Ivory', colourHex: '#F2ECE1', materialName: 'Voile' },
  { id: 'charcoal', label: 'Charcoal', colourHex: '#33302E', materialName: 'Voile' },
  { id: 'marigold', label: 'Marigold', colourHex: '#D99A2B', materialName: 'Voile' },
] as const;

// Which colours are available for which design — demonstrates UX-C5
// (unavailable options disabled, never hidden) and UX-C1b (preserve
// colour across a design change where it's still available).
export const devColourAvailabilityByDesign: Record<string, Record<string, 'available' | 'disabled' | 'low-stock'>> = {
  'teal-vine': { teal: 'available', rose: 'available', ivory: 'low-stock', charcoal: 'disabled', marigold: 'available' },
  'rose-border': { teal: 'disabled', rose: 'available', ivory: 'available', charcoal: 'available', marigold: 'low-stock' },
  'charcoal-medallion': { teal: 'available', rose: 'disabled', ivory: 'available', charcoal: 'available', marigold: 'available' },
  'marigold-check': { teal: 'low-stock', rose: 'available', ivory: 'available', charcoal: 'available', marigold: 'available' },
};

// Jacket selection is by DESIGN (blouse style), not colour — each
// thumbnail is a representative preview of a distinct jacket design.
export const devJacketDesigns = [
  { id: 'classic-brocade', name: 'Classic Brocade Blouse', thumbnailUrl: PLACEHOLDER },
  { id: 'embroidered-scoop', name: 'Embroidered Scoop Neck', thumbnailUrl: PLACEHOLDER },
  { id: 'plain-boatneck', name: 'Plain Boat Neck', thumbnailUrl: PLACEHOLDER },
  { id: 'puff-sleeve', name: 'Puff Sleeve Blouse', thumbnailUrl: PLACEHOLDER },
] as const;

export const devSuggested = [
  { id: 'teal-vine', name: 'Deep Teal Vine', thumbnailUrl: PLACEHOLDER },
  { id: 'rose-border', name: 'Rose Dust Border', thumbnailUrl: PLACEHOLDER },
  { id: 'marigold-check', name: 'Marigold Check', thumbnailUrl: PLACEHOLDER },
] as const;
