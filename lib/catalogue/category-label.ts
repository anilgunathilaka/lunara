import 'server-only';
import { getLocale, getTranslations } from 'next-intl/server';

/** The four founding categories have approved names in every language (messages: product.categories). */
const KEYS: Record<string, 'cotton' | 'handloom' | 'batik' | 'handPainting'> = {
  cotton: 'cotton',
  handloom: 'handloom',
  batik: 'batik',
  'hand-painting': 'handPainting',
};

/**
 * A saree category's name in the page's language (PRD v4.0). English shows
 * the name as the admin wrote it; Sinhala and Tamil show the translated name
 * for the four founding categories, and the admin's name for any added later
 * (it has no translation yet).
 */
export async function categoryNamer(): Promise<(id: string, name: string) => string> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('product.categories')]);
  return (id, name) => {
    const key = KEYS[id];
    return locale === 'en' || !key ? name : t(key);
  };
}
