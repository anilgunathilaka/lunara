/**
 * What an ops action just did, so the page it returns to can say so plainly
 * (?saved=<code>, shown by OpsFlash in app/[locale]/ops/shared.tsx). Each code
 * has a message under ops.done in messages/{en,si,ta}.json.
 */
export const OPS_DONE_CODES = [
  'sareeAdded',
  'sareeUpdated',
  'sareeArchived',
  'sareeRestored',
  'sareeDeleted',
  'jacketAdded',
  'jacketUpdated',
  'jacketArchived',
  'jacketRestored',
  'jacketDeleted',
  'categoryAdded',
  'categoryUpdated',
  'costSaved',
  'stockUpdated',
  'thresholdSaved',
  'sareePriceSaved',
  'jacketPriceSaved',
  'startingPriceSaved',
  'photoRemoved',
  'coverSet',
  'orderUpdated',
  'notificationSent',
  'replySaved',
  'reviewHidden',
  'reviewShown',
  'saleRecorded',
  'paymentRecorded',
  'paymentVoided',
  'planUpdated',
  'saleCancelled',
  'customerUpdated',
] as const;

export type OpsDoneCode = (typeof OPS_DONE_CODES)[number];

export function isOpsDoneCode(value: unknown): value is OpsDoneCode {
  return typeof value === 'string' && (OPS_DONE_CODES as readonly string[]).includes(value);
}
