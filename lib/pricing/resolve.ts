import 'server-only';

/**
 * THE only place a customer price is derived (docs/4-architecture.md §3.3,
 * §7.1; CLAUDE.md "Price: one source of truth"). Catalogue pages, the
 * configurator and checkout all resolve through these functions on the
 * server; the client only ever receives their results.
 *
 * All amounts are whole LKR.
 */

/**
 * A saree paired with a jacket material: the saree's price plus the jacket's
 * pairing add-on. For a curated saree the saree price is its own
 * curated_listing.price (PRD v4.2); for Design Your Own it is the
 * PRICE_MATRIX cell for its design × category.
 */
export function resolvePairedPrice(input: { sareePrice: number; jacketPairingAddOn: number }): number {
  return input.sareePrice + input.jacketPairingAddOn;
}

/** Jacket material sold on its own (PRD FR-29). */
export function resolveStandaloneJacketPrice(input: { standalonePrice: number }): number {
  return input.standalonePrice;
}
