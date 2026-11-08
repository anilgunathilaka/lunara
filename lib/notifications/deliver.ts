import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrisma } from '@/lib/prisma';
import { sendEmail } from './providers';

/**
 * Sends due automatic notifications with retry and backoff
 * (docs/4-architecture.md §6.1). Safe to run concurrently: each row is
 * claimed with a compare-and-set lease before sending.
 */

const MAX_ATTEMPTS = 5;
const LEASE_MS = 5 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export interface DeliveryReport {
  sent: number;
  retrying: number;
  failed: number;
}

export async function deliverDue(limit = 25): Promise<DeliveryReport> {
  const prisma = getPrisma();
  const now = new Date();
  const due = await prisma.notification.findMany({
    where: { status: 'pending', dueAt: { lte: now } },
    orderBy: { dueAt: 'asc' },
    take: limit,
  });
  const report: DeliveryReport = { sent: 0, retrying: 0, failed: 0 };

  for (const row of due) {
    // Lease: only one runner wins the row; a crashed runner's lease expires.
    const { count } = await prisma.notification.updateMany({
      where: { id: row.id, status: 'pending', dueAt: row.dueAt },
      data: { dueAt: new Date(now.getTime() + LEASE_MS) },
    });
    if (count !== 1) continue;

    try {
      if (row.channel !== 'email') throw new Error(`No provider for ${row.channel}`);
      await sendEmail(row.recipient, row.subject ?? '', row.body);
      await prisma.notification.update({
        where: { id: row.id },
        data: { status: 'sent', sentAt: new Date(), sentBy: 'system', attempts: { increment: 1 }, lastError: null },
      });
      report.sent += 1;
    } catch (error) {
      const attempts = row.attempts + 1;
      const giveUp = attempts >= MAX_ATTEMPTS;
      await prisma.notification.update({
        where: { id: row.id },
        data: {
          attempts,
          status: giveUp ? 'failed' : 'pending',
          // 2, 4, 8, 16 minutes.
          dueAt: new Date(Date.now() + 2 ** attempts * MINUTE_MS),
          lastError: String(error instanceof Error ? error.message : error).slice(0, 500),
        },
      });
      if (giveUp) report.failed += 1;
      else report.retrying += 1;
    }
  }
  return report;
}

/** After an order change commits: try at once, without delaying the response. */
export function deliverSoon(): void {
  const work = deliverDue().catch((error: unknown) => {
    console.error('[notifications] immediate delivery failed:', error instanceof Error ? error.message : error);
  });
  if (process.env.NODE_ENV === 'production') {
    try {
      getCloudflareContext().ctx.waitUntil(work);
      return;
    } catch {
      // Not on the Worker (e.g. `next start` locally): the promise still runs.
    }
  }
  void work;
}
