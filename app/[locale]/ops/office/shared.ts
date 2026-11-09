import type { InstalmentState } from '@/lib/office/plan';

/** Colour of an instalment's state: overdue in danger, part-paid in warning. */
export function stateClass(state: InstalmentState): string | undefined {
  return state === 'overdue' ? 'ops-status-out' : state === 'partly' ? 'ops-status-low' : undefined;
}
