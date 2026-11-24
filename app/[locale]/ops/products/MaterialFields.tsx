/**
 * Weight, length and opacity for one saree (founder decision 2026-11-24):
 * shown under Material on its product page. Weight is in grams, saree and
 * jacket material together, and shows only when entered. Length or opacity
 * left empty uses the category's value.
 */
export interface MaterialFieldsProps {
  labels: {
    legend: string;
    weight: string;
    weightHint: string;
    length: string;
    opacity: string;
    fromCategory: string;
    /** Short word for the default option, e.g. "Semi-sheer (category)". */
    category: string;
    note: string;
    opaque: string;
    semiSheer: string;
    sheer: string;
  };
  /** This saree's own values, if set. */
  values?: { weightGrams: number | null; lengthMetres: number | null; opacity: string | null };
  /** The category's values, shown as the placeholder when a box is empty. */
  category?: { lengthMetres: number; opacity: string };
}

export function MaterialFields({ labels, values, category }: MaterialFieldsProps) {
  const opacityName = (v: string) => (v === 'sheer' ? labels.sheer : v === 'semi_sheer' ? labels.semiSheer : labels.opaque);
  return (
    <fieldset>
      <legend>{labels.legend}</legend>
      <div className="ops-form-row">
        <div className="flex flex-col gap-1">
          <label className="field-label" htmlFor="weightGrams">
            {labels.weight}
          </label>
          <input
            id="weightGrams"
            name="weightGrams"
            type="number"
            min={50}
            max={5000}
            step={1}
            inputMode="numeric"
            className="input ops-number-input"
            defaultValue={values?.weightGrams ?? ''}
            placeholder={labels.weightHint}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="field-label" htmlFor="lengthMetres">
            {labels.length}
          </label>
          <input
            id="lengthMetres"
            name="lengthMetres"
            type="number"
            min={1}
            max={15}
            step={0.01}
            inputMode="decimal"
            className="input ops-number-input"
            defaultValue={values?.lengthMetres ?? ''}
            placeholder={category ? String(category.lengthMetres) : labels.fromCategory}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="field-label" htmlFor="opacity">
            {labels.opacity}
          </label>
          <select id="opacity" name="opacity" className="input" defaultValue={values?.opacity ?? ''}>
            <option value="">{category ? `${opacityName(category.opacity)} (${labels.category})` : labels.fromCategory}</option>
            <option value="opaque">{labels.opaque}</option>
            <option value="semi_sheer">{labels.semiSheer}</option>
            <option value="sheer">{labels.sheer}</option>
          </select>
        </div>
      </div>
      <p className="field-message">{labels.note}</p>
    </fieldset>
  );
}
