/** Dates as Sri Lankan customers and staff read them: local time, in the page's language. */

export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(`${locale}-LK`, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Colombo',
  }).format(date);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(`${locale}-LK`, { dateStyle: 'medium', timeZone: 'Asia/Colombo' }).format(date);
}
