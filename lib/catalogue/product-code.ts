/**
 * Product-code prefixes for saree categories (PRD v4.0, founder decision
 * 2026-11-14): LS (Lunara Sarees), then the first letter of each word of the
 * category name, leaving out "saree"/"sarees". Cotton sarees → LSC,
 * Handloom sarees → LSH, Batik sarees → LSB, Hand painting sarees → LSHP.
 * When the letters are already taken, the next letter of the last word is
 * added (Handwoven sarees → LSHA), then the one after; a number is the last
 * resort. Pure: used by the admin form preview and by the server action.
 */

const FILLER = new Set(['saree', 'sarees']);

function words(name: string): string[] {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter((word) => word && !FILLER.has(word.toLowerCase()));
}

/** The prefix for a new category, given the prefixes already in use; null when the name has no Latin letters. */
export function codePrefixFor(name: string, taken: Iterable<string>): string | null {
  const used = new Set([...taken].map((prefix) => prefix.toUpperCase()));
  const parts = words(name);
  if (parts.length === 0) return null;
  let prefix = `LS${parts.map((word) => word[0]).join('')}`;
  const last = parts[parts.length - 1]!;
  for (let i = 1; used.has(prefix) && i < last.length; i += 1) prefix += last[i];
  if (!used.has(prefix)) return prefix;
  for (let n = 2; ; n += 1) if (!used.has(`${prefix}${n}`)) return `${prefix}${n}`;
}

/** "LSC" and 9 → "LSC009"; three digits at least. */
export function formatProductCode(prefix: string, n: number): string {
  return `${prefix}${String(n).padStart(3, '0')}`;
}
