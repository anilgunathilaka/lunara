/**
 * Delivery zones, fees and the COD fee (docs/4-architecture.md §3.4, §7.1).
 *
 * PLACEHOLDER VALUES — not yet agreed with couriers (PRD OPS-15) or set by
 * the business (PRD Q5). This module is the single source for them until
 * they move into the operations panel; nothing else hard-codes a fee.
 *
 * Shared by server and client: the client may DISPLAY these (e.g. the fee
 * range in the cart), but every order total is computed on the server.
 */

export type ZoneId = 'western' | 'island' | 'north-east';

export interface DeliveryZone {
  id: ZoneId;
  fee: number;
  /** Honest working-day range, never a single optimistic figure (docs/1-ux.md §3.4). */
  minDays: number;
  maxDays: number;
}

export const DELIVERY_ZONES: Record<ZoneId, DeliveryZone> = {
  western: { id: 'western', fee: 350, minDays: 1, maxDays: 2 },
  island: { id: 'island', fee: 450, minDays: 2, maxDays: 4 },
  'north-east': { id: 'north-east', fee: 550, minDays: 3, maxDays: 5 },
};

/** All 25 districts. Ids are stable keys; display names come from messages (districts.*). */
export const DISTRICT_ZONES = {
  colombo: 'western',
  gampaha: 'western',
  kalutara: 'western',
  kandy: 'island',
  matale: 'island',
  'nuwara-eliya': 'island',
  galle: 'island',
  matara: 'island',
  hambantota: 'island',
  kurunegala: 'island',
  puttalam: 'island',
  anuradhapura: 'island',
  polonnaruwa: 'island',
  badulla: 'island',
  monaragala: 'island',
  ratnapura: 'island',
  kegalle: 'island',
  jaffna: 'north-east',
  kilinochchi: 'north-east',
  mannar: 'north-east',
  vavuniya: 'north-east',
  mullaitivu: 'north-east',
  batticaloa: 'north-east',
  ampara: 'north-east',
  trincomalee: 'north-east',
} as const satisfies Record<string, ZoneId>;

export type DistrictId = keyof typeof DISTRICT_ZONES;

export const DISTRICT_IDS = Object.keys(DISTRICT_ZONES) as DistrictId[];

export function isDistrictId(value: string): value is DistrictId {
  return Object.hasOwn(DISTRICT_ZONES, value);
}

export function zoneForDistrict(district: DistrictId): DeliveryZone {
  return DELIVERY_ZONES[DISTRICT_ZONES[district]];
}

/** Charged only for cash on delivery; waived on prepayment. */
export const COD_FEE = 350;

const fees = Object.values(DELIVERY_ZONES).map((z) => z.fee);
/** For the cart, before a district is chosen. */
export const DELIVERY_FEE_RANGE = { min: Math.min(...fees), max: Math.max(...fees) };
