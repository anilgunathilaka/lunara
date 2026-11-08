/**
 * View models the catalogue pages render. Produced on the server by
 * lib/catalogue/queries.ts; prices and stock states arrive already
 * resolved (docs/4-architecture.md §3.3).
 */
import type { StockStateValue } from '@/lib/stock/state';

export type Occasion = 'office' | 'everyday' | 'festive' | 'temple';
export type Opacity = 'opaque' | 'semi-sheer' | 'sheer';
export type MaterialId = 'plain' | 'super';

/** A curated listing (purchase path A). */
export interface CatalogueProduct {
  id: string;
  name: string;
  material: MaterialId;
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
  stockState: StockStateValue;
  quantity?: number;
}

/** A jacket colourway on the standalone line (PRD FR-29 to FR-32). */
export interface JacketProduct {
  id: string;
  materialName: string;
  colourName: string;
  swatchHex: string;
  composition: string;
  pieceLengthMetres: number;
  price: number;
  stockState: StockStateValue;
  quantity?: number;
}

export interface JacketProductDetail extends JacketProduct {
  /** Curated listings that use this jacket colourway (FR-31). */
  pairsWith: { id: string; name: string }[];
}

/** Everything the configurator (purchase path B) needs, prices pre-resolved. */
export interface ConfiguratorCatalogue {
  designs: { id: string; name: string; thumbnailUrl: string }[];
  jackets: {
    id: string;
    name: string;
    materialName: string;
    colourName: string;
    swatchHex: string;
    thumbnailUrl: string;
    stockState: StockStateValue;
  }[];
  /** Customer price keyed by quoteKey(design, material, jacket). */
  quotes: Record<string, number>;
  /** Super minus Plain for a design + jacket, keyed by deltaKey (UX-C10b). */
  materialDeltas: Record<string, number>;
}

export function quoteKey(designId: string, materialId: MaterialId, jacketId: string): string {
  return `${designId}|${materialId}|${jacketId}`;
}

export function deltaKey(designId: string, jacketId: string): string {
  return `${designId}|${jacketId}`;
}

/** Until product photography exists (OPS-02), every image is this placeholder. */
export const PLACEHOLDER_IMAGE = '/placeholder/product.jpg';
