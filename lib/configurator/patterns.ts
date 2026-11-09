/**
 * Fabric textures for the 3D preview (docs/4-architecture.md §5.0), drawn on
 * a canvas in the browser. Every colour is derived from the selection's own
 * colour (catalogue data) or read from a design token: no colour values live
 * in this file.
 *
 * Until a design has an uploaded tintable pattern asset, it is drawn with a
 * built-in motif chosen by its id, so the preview is never blank.
 */

export type Material = 'plain' | 'super';
/** body: flared skirt and frill; column: the straight Osariya skirt; pallu: the shoulder drape. */
export type FabricPart = 'body' | 'column' | 'pallu';

const SIZE = 1024;

/** A design token's value, e.g. cssVar('--lun-gold'). */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** "#RRGGBB" (catalogue data) → HSL. Falls back to a mid grey for anything else. */
function toHsl(hex: string): Hsl {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 0, l: 50 };
  const [r, g, b] = [m[1]!, m[2]!, m[3]!].map((v) => parseInt(v, 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const hsl = ({ h, s, l }: Hsl, alpha = 1) => `hsla(${h.toFixed(1)}, ${clamp(s, 0, 100).toFixed(1)}%, ${clamp(l, 0, 100).toFixed(1)}%, ${alpha})`;

/** The motif tone: lighter on dark cloth, darker on light cloth, so it always reads. */
function motifTone(base: Hsl): Hsl {
  return base.l < 45 ? { ...base, l: base.l + 24, s: base.s * 0.85 } : { ...base, l: base.l - 22, s: base.s * 1.05 };
}
function borderTone(base: Hsl): Hsl {
  return base.l < 45 ? { ...base, l: base.l - 8 } : { ...base, l: base.l - 32 };
}

type Motif = (ctx: CanvasRenderingContext2D, tone: string, scale: number) => void;

function tile(ctx: CanvasRenderingContext2D, step: number, draw: (x: number, y: number, row: number) => void) {
  for (let row = 0, y = step / 2; y < SIZE + step; y += step, row += 1) {
    for (let x = (row % 2) * (step / 2); x < SIZE + step; x += step) draw(x, y, row);
  }
}

const MOTIFS: Record<string, Motif> = {
  vine(ctx, tone, k) {
    ctx.strokeStyle = tone;
    ctx.fillStyle = tone;
    ctx.lineWidth = 5 * k;
    const step = 170 * k;
    for (let x = 0; x < SIZE + step; x += step) {
      ctx.beginPath();
      for (let y = 0; y <= SIZE; y += 8) ctx.lineTo(x + Math.sin(y / (55 * k)) * 26 * k, y);
      ctx.stroke();
      for (let y = 30; y < SIZE; y += 90 * k) {
        const side = Math.sin(y / (55 * k)) > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(x + side * 30 * k, y, 18 * k, 8 * k, side * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  border() {
    // The body stays plain: the wide border carries this design.
  },
  medallion(ctx, tone, k) {
    ctx.strokeStyle = tone;
    ctx.fillStyle = tone;
    tile(ctx, 150 * k, (x, y) => {
      ctx.lineWidth = 4 * k;
      ctx.beginPath();
      ctx.arc(x, y, 38 * k, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 14 * k, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * 26 * k, y + Math.sin(a) * 26 * k, 4 * k, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
  check(ctx, tone, k) {
    ctx.fillStyle = tone;
    const step = 96 * k;
    for (let p = 0; p < SIZE; p += step) {
      ctx.fillRect(p, 0, 10 * k, SIZE);
      ctx.fillRect(0, p, SIZE, 10 * k);
      ctx.fillRect(p + 24 * k, 0, 3 * k, SIZE);
      ctx.fillRect(0, p + 24 * k, SIZE, 3 * k);
    }
  },
  lattice(ctx, tone, k) {
    ctx.strokeStyle = tone;
    ctx.lineWidth = 4 * k;
    const step = 110 * k;
    for (let p = -SIZE; p < SIZE * 2; p += step) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p + SIZE, SIZE);
      ctx.moveTo(p, SIZE);
      ctx.lineTo(p + SIZE, 0);
      ctx.stroke();
    }
    ctx.fillStyle = tone;
    tile(ctx, step, (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y - step / 2, 7 * k, 0, Math.PI * 2);
      ctx.fill();
    });
  },
  paisley(ctx, tone, k) {
    ctx.fillStyle = tone;
    ctx.strokeStyle = tone;
    ctx.lineWidth = 3 * k;
    tile(ctx, 140 * k, (x, y, row) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(row % 2 ? 0.5 : -0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, 18 * k, 30 * k, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(10 * k, -30 * k, 12 * k, Math.PI * 0.2, Math.PI * 1.3);
      ctx.stroke();
      ctx.restore();
    });
  },
  stripe(ctx, tone, k) {
    ctx.fillStyle = tone;
    const step = 70 * k;
    for (let x = 0; x < SIZE; x += step) {
      ctx.fillRect(x, 0, 18 * k, SIZE);
      ctx.fillRect(x + 30 * k, 0, 4 * k, SIZE);
    }
  },
  'block-print'(ctx, tone, k) {
    ctx.fillStyle = tone;
    tile(ctx, 90 * k, (x, y) => {
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * 11 * k, y + Math.sin(a) * 11 * k, 9 * k, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
};
const MOTIF_ORDER = ['vine', 'medallion', 'check', 'lattice', 'paisley', 'stripe', 'block-print'];

function motifFor(designId: string): Motif {
  if (MOTIFS[designId]) return MOTIFS[designId]!;
  // Unknown designs still get a stable motif, chosen from their id.
  let hash = 0;
  for (const ch of designId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return MOTIFS[MOTIF_ORDER[hash % MOTIF_ORDER.length]!]!;
}

/** Fine weave lines: Plain is coarser and more visible, Super finer and smoother. */
function weave(ctx: CanvasRenderingContext2D, base: Hsl, material: Material) {
  const step = material === 'plain' ? 6 : 3;
  ctx.fillStyle = hsl({ ...base, l: base.l - 12 }, material === 'plain' ? 0.16 : 0.08);
  for (let p = 0; p < SIZE; p += step) {
    ctx.fillRect(p, 0, 1, SIZE);
    ctx.fillRect(0, p, SIZE, 1);
  }
}

/** Zari-style border band in the gold token, edged with the deeper border tone. */
function borderBand(ctx: CanvasRenderingContext2D, y: number, height: number, base: Hsl, designId: string) {
  ctx.fillStyle = hsl(borderTone(base));
  ctx.fillRect(0, y, SIZE, height);
  const gold = cssVar('--lun-gold');
  ctx.fillStyle = gold;
  const rule = Math.max(4, height * 0.08);
  ctx.fillRect(0, y + rule, SIZE, rule);
  ctx.fillRect(0, y + height - rule * 2, SIZE, rule);
  // A row of small motifs inside the band.
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  const mid = y + height / 2;
  const step = designId === 'border' ? 48 : 64;
  for (let x = step / 2; x < SIZE; x += step) {
    ctx.beginPath();
    ctx.moveTo(x - step / 4, mid);
    ctx.lineTo(x, mid - height / 5);
    ctx.lineTo(x + step / 4, mid);
    ctx.lineTo(x, mid + height / 5);
    ctx.closePath();
    ctx.stroke();
  }
}

export interface FabricOptions {
  designId: string;
  colourHex: string;
  material: Material;
  part: FabricPart;
  /** An uploaded tintable pattern (light = cloth colour, dark = motif), already loaded. */
  pattern?: CanvasImageSource | null;
}

/**
 * The saree fabric as a square canvas: v=0 (canvas bottom) is the hem, where
 * the border runs; the pallu is denser and bordered at its end.
 */
export function drawFabric({ designId, colourHex, material, part, pattern }: FabricOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const base = toHsl(colourHex);

  ctx.fillStyle = hsl(base);
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (pattern) {
    // Tint the uploaded pattern by the saree colour (recolourable designs).
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(pattern, 0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    // The column skirt wraps once around the body, so its motifs are drawn smaller.
    motifFor(designId)(ctx, hsl(motifTone(base), 0.85), part === 'pallu' ? 0.75 : part === 'column' ? 0.5 : 1);
  }
  weave(ctx, base, material);

  if (part === 'column') {
    // Kandyan Osariya: the border runs down the front (u = 0, the texture's
    // edges, which meet at the centre front) and along the hem.
    borderBand(ctx, SIZE - SIZE * 0.1, SIZE * 0.1, base, designId);
    ctx.save();
    ctx.translate(SIZE, 0);
    ctx.rotate(Math.PI / 2);
    borderBand(ctx, 0, SIZE * 0.045, base, designId);
    borderBand(ctx, SIZE - SIZE * 0.045, SIZE * 0.045, base, designId);
    ctx.restore();
  } else if (part === 'body') {
    // Hem border at the bottom; a narrow one at the waist.
    borderBand(ctx, SIZE - SIZE * (designId === 'border' ? 0.2 : 0.12), SIZE * (designId === 'border' ? 0.2 : 0.12), base, designId);
    borderBand(ctx, 0, SIZE * 0.035, base, designId);
  } else {
    // Pallu: borders on both long edges, a wide band at its end (top of the canvas = hanging end).
    borderBand(ctx, 0, SIZE * 0.22, base, designId);
    ctx.save();
    ctx.translate(SIZE, 0);
    ctx.rotate(Math.PI / 2);
    borderBand(ctx, 0, SIZE * 0.07, base, designId);
    borderBand(ctx, SIZE - SIZE * 0.07, SIZE * 0.07, base, designId);
    ctx.restore();
  }
  return canvas;
}

/** The jacket material: its colour with a fine weave, or its swatch photograph tiled. */
export function drawJacket(colourHex: string, photo?: CanvasImageSource | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const base = toHsl(colourHex);
  if (photo) {
    ctx.drawImage(photo, 0, 0, 512, 512);
  } else {
    ctx.fillStyle = hsl(base);
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = hsl({ ...base, l: base.l - 10 }, 0.12);
    for (let p = 0; p < 512; p += 4) {
      ctx.fillRect(p, 0, 1, 512);
      ctx.fillRect(0, p, 512, 1);
    }
  }
  return canvas;
}

/** A lighter version of a colour, for the fabric's sheen. */
export function sheenOf(colourHex: string): string {
  const base = toHsl(colourHex);
  return hsl({ ...base, l: clamp(base.l + 30, 0, 92), s: base.s * 0.6 });
}
