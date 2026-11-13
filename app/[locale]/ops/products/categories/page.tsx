import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { formatProductCode } from '@/lib/catalogue/product-code';
import { createCategoryAction, updateCategoryAction } from '@/lib/ops/category-actions';
import { getPrisma } from '@/lib/prisma';
import { requireStaffPage } from '@/lib/ops/staff';
import { OpsFlash, type OpsSearchParams } from '../../shared';
import { CategoryNameWithCode } from './CodePreview';

const OPACITIES = ['opaque', 'semi_sheer', 'sheer'] as const;

/**
 * Saree categories (PRD v4.0, founder decision 2026-11-14): the list with
 * each one's code prefix, next code and product count; a form per category
 * to correct its name, GSM, opacity and length; and a form to add one, whose
 * prefix is formed from its name. Plain forms: they work without JavaScript.
 */
export default async function OpsCategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: OpsSearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaffPage(locale, `/${locale}/ops/products/categories`);
  const [rows, query, t] = await Promise.all([
    getPrisma().cottonMaterial.findMany({
      where: { codePrefix: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { colourways: true } } },
    }),
    searchParams,
    getTranslations('ops.categories'),
  ]);
  const taken = rows.flatMap((row) => (row.codePrefix ? [row.codePrefix] : []));
  const opacityLabel = (value: (typeof OPACITIES)[number]) => t(`opacity.${value}`);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/ops/products" className="focus-ring field-message">
        ← {t('backToProducts')}
      </Link>
      <h2 className="checkout-step-title">{t('heading')}</h2>
      <OpsFlash searchParams={query} />
      <p className="field-message" style={{ maxWidth: '68ch' }}>
        {t('intro')}
      </p>

      <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.id}>
                <div>
                  <form action={updateCategoryAction} className="ops-inline-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={row.id} />
                    <label className="sr-only" htmlFor={`name-${row.id}`}>
                      {t('name')}
                    </label>
                    <input id={`name-${row.id}`} name="name" className="input" required minLength={2} maxLength={60} defaultValue={row.name} />
                    <span className="ops-muted">
                      {t('summary', { prefix: row.codePrefix!, next: formatProductCode(row.codePrefix!, row.nextNumber), count: row._count.colourways })}
                    </span>
                    <label className="ops-inline-form">
                      {t('gsm')}
                      <input name="gsm" type="number" min={20} max={1000} step={1} className="input ops-number-input" required defaultValue={row.gsm} />
                    </label>
                    <label className="ops-inline-form">
                      {t('opacityLabel')}
                      <select name="opacity" className="input" defaultValue={row.opacity}>
                        {OPACITIES.map((value) => (
                          <option key={value} value={value}>
                            {opacityLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="ops-inline-form">
                      {t('length')}
                      <input
                        name="lengthMetres"
                        type="number"
                        min={1}
                        max={20}
                        step={0.05}
                        className="input ops-number-input"
                        required
                        defaultValue={row.lengthMetres.toNumber()}
                      />
                    </label>
                    <Button type="submit" variant="secondary" size="sm">
                      {t('save')}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
      </ul>

      <form action={createCategoryAction} className="ops-form">
        <input type="hidden" name="locale" value={locale} />
        <fieldset>
          <legend>{t('addHeading')}</legend>
          <CategoryNameWithCode taken={taken} label={t('name')} hint={t('nameHint')} previewLabel={t('firstCode', { code: '{code}' })} />
          <div className="ops-form-row">
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="gsm">
                {t('gsm')}
              </label>
              <input id="gsm" name="gsm" type="number" min={20} max={1000} step={1} className="input ops-number-input" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="opacity">
                {t('opacityLabel')}
              </label>
              <select id="opacity" name="opacity" className="input" required defaultValue="semi_sheer">
                {OPACITIES.map((value) => (
                  <option key={value} value={value}>
                    {opacityLabel(value)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label" htmlFor="lengthMetres">
                {t('length')}
              </label>
              <input id="lengthMetres" name="lengthMetres" type="number" min={1} max={20} step={0.05} className="input ops-number-input" required />
            </div>
          </div>
          <p className="field-message">{t('ruleNote')}</p>
        </fieldset>
        <div>
          <Button type="submit">{t('add')}</Button>
        </div>
      </form>
    </div>
  );
}
