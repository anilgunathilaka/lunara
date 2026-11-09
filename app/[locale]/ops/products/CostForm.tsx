import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/primitives/Button';
import { COST_PARTS, marginOf, totalCost, type CostBreakdown } from '@/lib/costing/cost';
import { saveCostAction } from '@/lib/ops/cost-actions';
import { formatDateTime } from '@/lib/format/date';
import { formatPriceLKR } from '@/lib/pricing/format';

type Props = {
  locale: string;
  kind: 'saree' | 'jacket';
  id: string;
  cost: (CostBreakdown & { note: string | null; updatedBy: string; updatedAt: Date }) | null;
  /** The selling price this unit cost is measured against. */
  price: number;
  priceLabel: string;
};

/** Unit cost of one saree or jacket colour, with its margin (docs/4-architecture.md §3.11). Staff-only. */
export async function CostForm({ locale, kind, id, cost, price, priceLabel }: Props) {
  const t = await getTranslations('ops.costs');
  const total = cost ? totalCost(cost) : null;
  const margin = total === null ? null : marginOf(price, total);

  return (
    <form id="cost" action={saveCostAction} className="ops-form">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <fieldset>
        <legend>{t('legend')}</legend>
        <p className="field-message">{t(kind === 'saree' ? 'sareeNote' : 'jacketNote')}</p>
        <div className="ops-form-row">
          {COST_PARTS.map((part) => (
            <div key={part} className="flex flex-col gap-1">
              <label className="field-label" htmlFor={`cost-${part}`}>
                {t(`part.${part}`)}
              </label>
              <input
                id={`cost-${part}`}
                name={part}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="input ops-number-input"
                required
                defaultValue={cost ? cost[part] : 0}
              />
            </div>
          ))}
        </div>
        <label className="field-label" htmlFor="cost-note">
          {t('note')}
        </label>
        <input id="cost-note" name="note" className="input" maxLength={300} defaultValue={cost?.note ?? ''} placeholder={t('noteHint')} />

        {total === null || margin === null ? (
          <p className="field-message ops-status-low">{t('notEntered')}</p>
        ) : (
          <dl className="ops-cost-summary">
            <div>
              <dt>{t('unitCost')}</dt>
              <dd>{formatPriceLKR(total)}</dd>
            </div>
            <div>
              <dt>{priceLabel}</dt>
              <dd>{formatPriceLKR(price)}</dd>
            </div>
            <div>
              <dt>{t('profit')}</dt>
              <dd className={margin.profit < 0 ? 'ops-status-out' : undefined}>
                {formatPriceLKR(margin.profit)} · {t('percent', { percent: margin.percent })}
              </dd>
            </div>
          </dl>
        )}
        {cost && (
          <p className="field-message ops-muted">
            {t('lastUpdated', { who: cost.updatedBy, when: formatDateTime(cost.updatedAt, locale) })}
          </p>
        )}
      </fieldset>
      <div>
        <Button type="submit">{t('save')}</Button>
      </div>
    </form>
  );
}
