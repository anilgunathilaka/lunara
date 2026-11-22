import { getTranslations } from 'next-intl/server';

/**
 * Add or remove stock, in words rather than a signed number (docs/2-ui.md
 * §7.7): "Add 10, received from the supplier" instead of "+10". The reason
 * offers the usual ones and still takes any text. A plain form: works
 * without JavaScript.
 */
const REASONS = ['received', 'returned', 'damaged', 'lost', 'countCorrection'] as const;

export async function StockAdjustFields({ idPrefix, itemName, compact = false }: { idPrefix: string; itemName: string; compact?: boolean }) {
  const t = await getTranslations('ops.stock');
  const listId = `${idPrefix}-reasons`;
  const label = (key: string) => (compact ? `${t(key)} — ${itemName}` : undefined);

  const fields = (
    <>
      <select id={`${idPrefix}-direction`} name="direction" className="input ops-direction-select" defaultValue="add" aria-label={label('direction')}>
        <option value="add">{t('add')}</option>
        <option value="remove">{t('remove')}</option>
      </select>
      <input
        id={`${idPrefix}-amount`}
        className="input ops-number-input"
        name="amount"
        type="number"
        min={1}
        step={1}
        required
        aria-label={label('amount')}
        placeholder={compact ? t('amountShort') : undefined}
      />
      <input
        id={`${idPrefix}-reason`}
        className="input"
        name="reason"
        required
        minLength={2}
        maxLength={300}
        list={listId}
        aria-label={label('reason')}
        placeholder={t('reasonHint')}
      />
      <datalist id={listId}>
        {REASONS.map((r) => (
          <option key={r} value={t(`reasons.${r}`)} />
        ))}
      </datalist>
    </>
  );

  if (compact) return fields;

  return (
    <div className="ops-form-row">
      <div className="flex flex-col gap-1">
        <label className="field-label" htmlFor={`${idPrefix}-direction`}>
          {t('direction')}
        </label>
        <select id={`${idPrefix}-direction`} name="direction" className="input" defaultValue="add">
          <option value="add">{t('add')}</option>
          <option value="remove">{t('remove')}</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="field-label" htmlFor={`${idPrefix}-amount`}>
          {t('amount')}
        </label>
        <input id={`${idPrefix}-amount`} className="input ops-number-input" name="amount" type="number" min={1} step={1} required />
      </div>
      <div className="flex flex-col gap-1">
        <label className="field-label" htmlFor={`${idPrefix}-reason`}>
          {t('reason')}
        </label>
        <input
          id={`${idPrefix}-reason`}
          className="input"
          name="reason"
          required
          minLength={2}
          maxLength={300}
          list={listId}
          placeholder={t('reasonHint')}
        />
        <datalist id={listId}>
          {REASONS.map((r) => (
            <option key={r} value={t(`reasons.${r}`)} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
