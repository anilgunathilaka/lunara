/**
 * Switches for features that are built but not offered yet.
 *
 * designYourOwn: off while the 3D Osariya model is being produced
 * (docs/4-architecture.md §5.0; founder decision 2026-11-09). Every link to
 * it is hidden; the page itself still works at /design-your-own for testing.
 *
 * languageSelector: off for now (founder decision 2026-11-09). The site
 * opens in English and the choice of language is hidden everywhere; the
 * Sinhala and Tamil pages still work at /si and /ta, and every message stays
 * translated, so switching this back on restores all three at once.
 *
 * jacketMaterialPage: off (PRD v4.1, founder decision 2026-11-22). Lunara
 * sells the full saree only; jacket material is not sold on its own, so the
 * Jacket Material pages and every link to them are hidden. Jacket materials
 * stay in the admin and the inventory.
 *
 * shopFilters: off while the collection is small (founder decision
 * 2026-11-22). The shop shows every saree with Sort by only: no filter
 * column, no Filter button, and filters in the address are ignored.
 * Switching it on restores the filters as built (docs/2-ui.md §7.6).
 *
 * headerMenus: off for now (founder decision 2026-11-24). Shop and Support
 * stay in the header as plain links to their pages, without the dropdown
 * menus; switching it on restores both menus as built.
 *
 * shopHead: off for now (founder decision 2026-11-24). The shop page hides
 * its top bar (title, saree count, Sort by and the rule under it); the
 * title stays for screen readers and search engines, and the sarees show
 * in the default order. Switching it on restores the bar as built.
 */
export const FEATURES = {
  designYourOwn: false,
  languageSelector: false,
  shopFilters: false,
  jacketMaterialPage: false,
  headerMenus: false,
  shopHead: false,
} as const;
