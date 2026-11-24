import { getStaff } from '@/lib/ops/staff';
import { getPrisma } from '@/lib/prisma';

/**
 * The subscriber list as a CSV file, for staff only (founder decision
 * 2026-11-24). GET /api/ops/subscribers
 */

/** Quote a cell, and stop a spreadsheet from reading it as a formula. */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(): Promise<Response> {
  const staff = await getStaff();
  if (!staff) return new Response('Not found', { status: 404 });

  const rows = await getPrisma().subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  const lines = [
    ['Email', 'Mobile', 'Language', 'Signed up', 'Consent given'].map(cell).join(','),
    // The mobile is stored by us as +947XXXXXXXX, never as typed, so it is
    // written as is (a leading quote would spoil the number).
    ...rows.map((r) =>
      [cell(r.email ?? ''), `"${r.phone ?? ''}"`, cell(r.locale), cell(r.createdAt.toISOString()), cell(r.consentAt.toISOString())].join(','),
    ),
  ];
  // BOM first, so Excel reads the file as UTF-8.
  return new Response(`﻿${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="lunara-subscribers.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
