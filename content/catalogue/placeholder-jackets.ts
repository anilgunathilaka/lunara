/**
 * TEMPORARY placeholder data for /jacket-material and /jacket-material/[id]
 * (standalone jacket line, PRD FR-29 to FR-32). Same status as the other
 * content/catalogue/placeholder-*.ts files — no real stock/price source
 * exists yet.
 */
export interface JacketProduct {
  id: string;
  materialName: string;
  colourName: string;
  swatchHex: string;
  composition: string;
  pieceLengthMetres: number;
  price: number;
  stockState: 'in' | 'low' | 'out';
  quantity?: number;
  /** Sarees from placeholder-catalogue that pair well — FR-31. */
  pairsWithIds: string[];
}

export const placeholderJackets: JacketProduct[] = [
  {
    id: 'gold-brocade-antique',
    materialName: 'Gold Brocade',
    colourName: 'Antique gold',
    swatchHex: '#A07F35',
    composition: '100% cotton brocade',
    pieceLengthMetres: 1.2,
    price: 1800,
    stockState: 'in',
    pairsWithIds: ['teal-vine', 'plum-paisley'],
  },
  {
    id: 'plum-voile',
    materialName: 'Plum Voile',
    colourName: 'Plum',
    swatchHex: '#5A1E2D',
    composition: '100% cotton voile',
    pieceLengthMetres: 1.2,
    price: 1500,
    stockState: 'in',
    pairsWithIds: ['rose-border'],
  },
  {
    id: 'ivory-cotton',
    materialName: 'Ivory Cotton',
    colourName: 'Ivory',
    swatchHex: '#F2ECE1',
    composition: '100% plain cotton',
    pieceLengthMetres: 1.1,
    price: 1200,
    stockState: 'low',
    quantity: 3,
    pairsWithIds: ['charcoal-medallion', 'sage-stripe', 'indigo-block'],
  },
  {
    id: 'charcoal-voile',
    materialName: 'Charcoal Voile',
    colourName: 'Charcoal',
    swatchHex: '#33302E',
    composition: '100% cotton voile',
    pieceLengthMetres: 1.2,
    price: 1500,
    stockState: 'in',
    pairsWithIds: ['marigold-check'],
  },
  {
    id: 'marigold-cotton',
    materialName: 'Marigold Cotton',
    colourName: 'Marigold',
    swatchHex: '#D99A2B',
    composition: '100% plain cotton',
    pieceLengthMetres: 1.1,
    price: 1200,
    stockState: 'in',
    pairsWithIds: ['ivory-lattice'],
  },
];

export function getJacketProduct(id: string): JacketProduct | undefined {
  return placeholderJackets.find((jacket) => jacket.id === id);
}
