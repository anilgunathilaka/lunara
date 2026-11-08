import { z } from 'zod';
import { DISTRICT_IDS } from './delivery';

/**
 * What the client is allowed to send about a cart line: references and a
 * quantity, never a price (docs/4-architecture.md §3.4). Shared by the
 * cart (client) and the server actions, which validate with these schemas.
 */

export const MAX_LINES = 10;
export const MAX_QUANTITY = 5;

const id = z.string().min(1).max(100);

export const cartLineRefSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('listing'), listingId: id }),
  z.object({ kind: z.literal('jacket'), jacketColourwayId: id }),
  z.object({
    kind: z.literal('configured'),
    designId: id,
    materialId: z.enum(['plain', 'super']),
    colourName: z.string().min(1).max(100),
    jacketColourwayId: id,
    drape: z.enum(['saree', 'osariya']),
  }),
]);

export type CartLineRef = z.infer<typeof cartLineRefSchema>;

export const quoteLineSchema = z.object({
  /** The client's cart line id, echoed back so results map to lines. */
  key: z.string().min(1).max(100),
  ref: cartLineRefSchema,
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});

export type QuoteLineInput = z.infer<typeof quoteLineSchema>;

export const paymentMethodSchema = z.enum(['cod', 'bank_transfer']);
export type OfferedPaymentMethod = z.infer<typeof paymentMethodSchema>;

export const districtSchema = z.enum(DISTRICT_IDS as [string, ...string[]]);

export const quoteRequestSchema = z.object({
  lines: z.array(quoteLineSchema).min(1).max(MAX_LINES),
  district: districtSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

/** Sri Lankan mobile: 07XXXXXXXX, 7XXXXXXXX, +947XXXXXXXX or 947XXXXXXXX (spaces/dashes allowed). */
export function normaliseSriLankanMobile(input: string): string | null {
  const digits = input.replace(/[\s-]/g, '');
  const match = /^(?:\+?94|0)?(7\d{8})$/.exec(digits);
  return match ? `+94${match[1]}` : null;
}

export const customerDetailsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .max(20)
    .refine((v) => normaliseSriLankanMobile(v) !== null, 'phone'),
  email: z.union([z.literal(''), z.email().max(200)]).optional(),
  address: z.string().trim().min(5).max(500),
  district: districtSchema,
  /** Advisory only (docs/1-ux.md §3.4). ISO date, yyyy-mm-dd. */
  eventDate: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional(),
});

export const placeOrderSchema = z.object({
  lines: z.array(quoteLineSchema).min(1).max(MAX_LINES),
  details: customerDetailsSchema,
  paymentMethod: paymentMethodSchema,
  /** Must be literally true: the acknowledgement cannot be skipped or defaulted (CLAUDE.md). */
  unstitchedAcknowledged: z.literal(true),
  /** The total the customer last saw; a mismatch stops the order (§3.4). */
  expectedTotal: z.number().int().min(0),
  locale: z.enum(['en', 'si', 'ta']),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
