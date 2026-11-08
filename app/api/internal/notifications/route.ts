import { timingSafeEqual } from 'node:crypto';
import { deliverDue } from '@/lib/notifications/deliver';

/**
 * Called by the Worker's Cron Trigger (worker.ts) every 10 minutes to send
 * due and retrying notifications (docs/4-architecture.md §6.1). Requires
 * `Authorization: Bearer <CRON_SECRET>`; without CRON_SECRET configured
 * the endpoint does not exist.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return new Response('Not found', { status: 404 });

  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return new Response('Not found', { status: 404 });
  }

  const report = await deliverDue();
  return Response.json(report);
}
