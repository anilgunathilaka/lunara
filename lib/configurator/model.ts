/**
 * The 3D model for Design Your Own (docs/4-architecture.md §5.0).
 *
 * null → the built-in placeholder figure (lib/configurator/mannequin.ts).
 * To use a real model: put the .glb in public/models/ (or R2, with CORS
 * allowing this site) and set its URL here. Its garment parts must be
 * separate meshes named Saree, Pallu (or Pallu_saree / Pallu_osariya),
 * Jacket and optionally Frill_osariya; everything else is shown as modelled.
 */
export const CONFIGURATOR_MODEL_URL: string | null = null;
