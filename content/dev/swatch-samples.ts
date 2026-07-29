/**
 * Sample fabric colour data for the primitive QA pages under app/dev/**.
 * Not shipped product content — real colourways come from the catalogue
 * data source (Prisma / STOCK_ITEM), never hardcoded in a component.
 *
 * Lives in content/ (excluded from `npm run lint:tokens`) rather than in
 * a .ts file under components/ or app/, because colourHex is real
 * sampled-fabric data, not a design-system token — the same distinction
 * the lint script itself draws.
 */
export const devSwatchSamples = {
  teal: { label: 'Deep teal', materialName: 'Voile', colourHex: '#1F5C55' },
  rose: { label: 'Rose dust', materialName: 'Voile', colourHex: '#C98A8A' },
  ivory: { label: 'Ivory', materialName: 'Voile', colourHex: '#F2ECE1' },
  charcoal: { label: 'Charcoal', materialName: 'Voile', colourHex: '#33302E' },
  marigold: { label: 'Marigold', materialName: 'Voile', colourHex: '#D99A2B' },
} as const;
