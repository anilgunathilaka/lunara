import 'server-only';

/**
 * THE only place a customer price is derived (docs/4-architecture.md §3.3,
 * §7.1; CLAUDE.md "Price: one source of truth"). Catalogue pages, the
 * configurator and checkout all resolve through these functions on the
 * server; the client only ever receives their results.
 *
 * All amounts are whole LKR.
 */

/** Saree (design × material, from PRICE_MATRIX) paired with a jacket material. */
export function resolvePairedPrice(input: { matrixPrice: number; jacketPairingAddOn: number }): number {
  return input.matrixPrice + input.jacketPairingAddOn;
}

/** Jacket material sold on its own (PRD FR-29). */
export function resolveStandaloneJacketPrice(input: { standalonePrice: number }): number {
  return input.standalonePrice;
}
