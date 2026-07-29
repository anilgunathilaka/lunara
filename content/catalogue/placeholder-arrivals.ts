/**
 * TEMPORARY placeholder catalogue data for the homepage "New arrivals"
 * section. lib/stock/ has no real data source wired yet (no Prisma
 * query, no STOCK_ITEM records) — replace this with a real catalogue
 * fetch once that exists. Names, prices and images here are placeholder
 * sample data, not real inventory.
 */
export const placeholderArrivals = [
  {
    id: 'teal-vine',
    name: 'Deep Teal Vine',
    material: 'plain' as const,
    price: 8000,
    jacketMaterialName: 'Gold Brocade',
    jacketSwatchHex: '#A07F35',
    stockState: 'in' as const,
  },
  {
    id: 'rose-border',
    name: 'Rose Dust Border',
    material: 'super' as const,
    price: 9600,
    jacketMaterialName: 'Plum Voile',
    jacketSwatchHex: '#5A1E2D',
    stockState: 'in' as const,
  },
  {
    id: 'charcoal-medallion',
    name: 'Charcoal Medallion',
    material: 'plain' as const,
    price: 7800,
    jacketMaterialName: 'Ivory Cotton',
    jacketSwatchHex: '#F2ECE1',
    stockState: 'low' as const,
    quantity: 2,
  },
  {
    id: 'marigold-check',
    name: 'Marigold Check',
    material: 'super' as const,
    price: 9100,
    jacketMaterialName: 'Charcoal Voile',
    jacketSwatchHex: '#33302E',
    stockState: 'in' as const,
  },
  {
    id: 'ivory-lattice',
    name: 'Ivory Lattice',
    material: 'plain' as const,
    price: 7900,
    jacketMaterialName: 'Marigold Cotton',
    jacketSwatchHex: '#D99A2B',
    stockState: 'in' as const,
  },
  {
    id: 'plum-paisley',
    name: 'Plum Paisley',
    material: 'super' as const,
    price: 9400,
    jacketMaterialName: 'Gold Brocade',
    jacketSwatchHex: '#A07F35',
    stockState: 'out' as const,
  },
] as const;
