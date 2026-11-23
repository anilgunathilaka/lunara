/**
 * next/image quality for product photographs (shop cards, the saree page).
 * The optimiser's default 75 softens weave, print and embroidery; 90 keeps
 * them. Must be listed in images.qualities (next.config.ts). Thumbnails and
 * swatches keep the default. Shared by server and client components.
 */
export const PHOTO_QUALITY = 90;
