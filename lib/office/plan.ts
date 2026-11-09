/**
 * Instalment arithmetic for office sales (docs/4-architecture.md §3.13).
 * Pure: whether an instalment is paid is never stored — payments are
 * applied to instalments in order, so the plan can't drift from the money.
 * All amounts are whole LKR; dates are calendar days in Sri Lanka.
 */

export const MAX_INSTALMENTS = 3;
/** Item rows on the new-sale form. */
export const OFFICE_ITEM_ROWS = 6;

/** Today's date in Sri Lanka as YYYY-MM-DD. */
export function todayInSriLanka(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** YYYY-MM-DD → the Date Postgres stores for a `date` column. */
export function dateOnly(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/** A `date` column back to YYYY-MM-DD. */
export function dayOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Adds whole months, clamped to the month's last day (31 Jan + 1 → 28/29 Feb). */
export function addMonths(day: string, months: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return dayOf(target);
}

/** Splits a total into n whole-rupee parts; any remainder goes on the first. */
export function splitEvenly(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  return Array.from({ length: n }, (_, i) => (i === 0 ? total - base * (n - 1) : base));
}

export type InstalmentState = 'paid' | 'partly' | 'due' | 'overdue';

export type PlannedInstalment = { seq: number; dueDate: Date; amount: number };

export type AppliedInstalment = PlannedInstalment & { covered: number; remaining: number; state: InstalmentState };

/** Applies the amount paid to instalments in order. */
export function applyPayments(instalments: PlannedInstalment[], paid: number, today: string): AppliedInstalment[] {
  let left = paid;
  return [...instalments]
    .sort((a, b) => a.seq - b.seq)
    .map((inst) => {
      const covered = Math.max(0, Math.min(inst.amount, left));
      left -= covered;
      const remaining = inst.amount - covered;
      const state: InstalmentState =
        remaining === 0 ? 'paid' : dayOf(inst.dueDate) < today ? 'overdue' : covered > 0 ? 'partly' : 'due';
      return { ...inst, covered, remaining, state };
    });
}

export type SaleBalance = {
  paid: number;
  outstanding: number;
  overdue: number;
  next: AppliedInstalment | null;
  instalments: AppliedInstalment[];
};

export function balanceOf(total: number, instalments: PlannedInstalment[], payments: { amount: number; voidedAt: Date | null }[], today: string): SaleBalance {
  const paid = payments.filter((p) => !p.voidedAt).reduce((n, p) => n + p.amount, 0);
  const applied = applyPayments(instalments, paid, today);
  return {
    paid,
    outstanding: total - paid,
    overdue: applied.filter((i) => i.state === 'overdue').reduce((n, i) => n + i.remaining, 0),
    next: applied.find((i) => i.remaining > 0) ?? null,
    instalments: applied,
  };
}
