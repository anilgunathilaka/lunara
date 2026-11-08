import 'server-only';
import { connection } from 'next/server';
import type { OrderStatus } from '@prisma/client';
import { mediaUrl } from '@/lib/media/photos';
import { getPrisma } from '@/lib/prisma';
import { verifyReviewSignature } from './link';

/**
 * Verified customer reviews (PRD FR-46, docs/4-architecture.md §3.8).
 * Verified means: written from a delivered order's signed link, one per
 * order line. Published at once; hidden only for a recorded reason, never
 * for being critical.
 */

export const MAX_REVIEW_PHOTOS = 3;
export const MAX_REVIEW_PHOTO_BYTES = 8 * 1024 * 1024;
export const REVIEW_BODY_MIN = 10;
export const REVIEW_BODY_MAX = 2000;
export const HIDE_REASONS = ['personal_data', 'abusive', 'not_about_product'] as const;
export type HideReason = (typeof HIDE_REASONS)[number];

/** Reviews open once the order has reached the customer, including if it was later returned. */
const REVIEWABLE: readonly OrderStatus[] = ['delivered', 'return_requested', 'refunded', 'exchanged'];
export function isReviewable(status: OrderStatus): boolean {
  return REVIEWABLE.includes(status);
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/** The order behind a review link, or null if the link is wrong. */
export async function getReviewOrder(number: string, signature: string) {
  if (!verifyReviewSignature(number, signature)) return null;
  return getPrisma().order.findUnique({
    relationLoadStrategy: 'join',
    where: { number },
    select: {
      id: true,
      number: true,
      status: true,
      customerName: true,
      district: true,
      locale: true,
      lines: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          title: true,
          materialName: true,
          sareeColourName: true,
          jacketMaterialName: true,
          jacketColourName: true,
          listingId: true,
          review: { select: { rating: true, body: true, photos: true, status: true } },
        },
      },
    },
  });
}

export interface PublicReview {
  id: string;
  rating: number;
  body: string;
  displayName: string;
  district: string;
  photos: string[];
  createdAt: Date;
  response: string | null;
  respondedAt: Date | null;
  /** What was bought, for reviews shown outside a product page. */
  title: string;
}

const publicSelect = {
  id: true,
  rating: true,
  body: true,
  displayName: true,
  district: true,
  photos: true,
  createdAt: true,
  response: true,
  respondedAt: true,
  orderLine: { select: { title: true } },
} as const;

type PublicRow = {
  id: string;
  rating: number;
  body: string;
  displayName: string;
  district: string;
  photos: string[];
  createdAt: Date;
  response: string | null;
  respondedAt: Date | null;
  orderLine: { title: string };
};

function toPublic(row: PublicRow): PublicReview {
  return { ...row, photos: row.photos.map(mediaUrl), title: row.orderLine.title };
}

export interface ReviewSummary {
  count: number;
  /** One decimal place; null when there are no reviews. */
  average: number | null;
}

/** Published reviews of one curated listing, newest first, with the summary over all of them. */
export async function listingReviews(listingId: string, take = 20): Promise<{ reviews: PublicReview[]; summary: ReviewSummary }> {
  // First: marks the page per-request, so `next build` never needs a database (CI has none).
  await connection();
  const prisma = getPrisma();
  const where = { listingId, status: 'published' as const };
  const [rows, agg] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, take, select: publicSelect }),
    prisma.review.aggregate({ where, _count: { _all: true }, _avg: { rating: true } }),
  ]);
  const average = agg._avg.rating;
  return {
    reviews: rows.map(toPublic),
    summary: { count: agg._count._all, average: average === null ? null : Math.round(average * 10) / 10 },
  };
}

/** Latest published reviews for the home page, photo reviews first. Never filtered by rating. */
export async function latestReviews(take = 3): Promise<PublicReview[]> {
  await connection();
  const prisma = getPrisma();
  const withPhotos = await prisma.review.findMany({
    where: { status: 'published', NOT: { photos: { isEmpty: true } } },
    orderBy: { createdAt: 'desc' },
    take,
    select: publicSelect,
  });
  if (withPhotos.length >= take) return withPhotos.map(toPublic);
  const rest = await prisma.review.findMany({
    where: { status: 'published', id: { notIn: withPhotos.map((r) => r.id) } },
    orderBy: { createdAt: 'desc' },
    take: take - withPhotos.length,
    select: publicSelect,
  });
  return [...withPhotos, ...rest].map(toPublic);
}
