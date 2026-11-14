/**
 * View models the catalogue pages render. Produced on the server by
 * lib/catalogue/queries.ts; prices and stock states arrive already
 * resolved (docs/4-architecture.md §3.3).
 */
import type { StockStateValue } from '@/lib/stock/state';

export type Occasion = 'office' | 'everyday' | 'festive' | 'temple';
export type Opacity = 'opaque' | 'semi-sheer' | 'sheer';
/** The configurator's two-material axis (switched off; reworked to categories when it returns, PRD v4.0). */
export type MaterialId = 'plain' | 'super';

/** A saree category (PRD v4.0): Cotton, Handloom, Batik, Hand painting, and any the admin adds. */
export interface SareeCategory {
  id: string;
  name: string;
}

/** A curated listing (purchase path A). */
export interface CatalogueProduct {
  id: string;
  name: string;
  /** Unique product code (LSC001 …), generated when the product was added. */
  productCode: string | null;
  categoryId: string;
  categoryName: string;
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
  /** The jacket's photograph (founder decision 2026-11-14); the colour block stands in until one exists. */
  jacketSwatchUrl: string | null;
  jacketPieceLengthMetres: number;
  stockState: StockStateValue;
  quantity?: number;
  /** Cover photo: the first gallery photo, or the placeholder until one exists. */
  imageUrl: string;
  /** Gallery photos in display order; empty until photographed (§3.7). */
  gallery: string[];
  /** The unretouched daylight colour reference (§4), once photographed. */
  referenceFrameUrl: string | null;
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
  /** Swatch photograph, once uploaded; pages fall back to the colour block. */
  swatchImageUrl: string | null;
}

export interface JacketProductDetail extends JacketProduct {
  /** Curated listings that use this jacket colourway (FR-31). */
  pairsWith: { id: string; name: string }[];
}

/** Everything the configurator (purchase path B) needs, prices pre-resolved. */
export interface ConfiguratorCatalogue {
  designs: {
    id: string;
    name: string;
    thumbnailUrl: string;
    /** Tintable pattern asset, once uploaded; the 3D preview draws a built-in pattern until then. */
    patternUrl: string | null;
  }[];
  jackets: {
    id: string;
    name: string;
    materialName: string;
    colourName: string;
    swatchHex: string;
    thumbnailUrl: string;
    /** Swatch photograph, tiled onto the 3D jacket when present. */
    textureUrl: string | null;
    stockState: StockStateValue;
  }[];
  /** Every saree colour in the range: any design previews in any of them (recolourable). */
  colours: { name: string; hex: string }[];
  /** What can actually be bought: stocked colourways keyed by colourwayKey(design, material). */
  colourways: Record<string, { colourName: string; stockState: StockStateValue; quantity?: number }[]>;
  /** Weave texture per cotton material, once uploaded. */
  materialTextures: Record<MaterialId, string | null>;
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

export function colourwayKey(designId: string, materialId: MaterialId): string {
  return `${designId}|${materialId}`;
}

/** Shown wherever a product has no photograph yet (OPS-02). */
export const PLACEHOLDER_IMAGE = '/placeholder/product.jpg';
