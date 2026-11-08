import { Radio } from '@/components/primitives/Radio';
import { setRequestLocale } from 'next-intl/server';

/**
 * Internal QA scratch page for the Radio primitive (docs/3-components.md
 * §2.2). Not part of the shipped product surface — delete or gate behind
 * an env check before launch.
 */
export default async function RadioQaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="mx-auto flex max-w-[420px] flex-col gap-6 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Radio — QA
      </h1>

      <fieldset className="flex flex-col gap-2">
        <legend className="field-label">Drape</legend>
        <Radio id="drape-saree" name="drape" label="Saree" defaultChecked />
        <Radio id="drape-osariya" name="drape" label="Kandyan Osariya" />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="field-label">Disabled option</legend>
        <Radio id="disabled-unchecked" name="disabled-group" label="Unchecked" disabled />
        <Radio
          id="disabled-checked"
          name="disabled-group"
          label="Checked"
          disabled
          defaultChecked
        />
      </fieldset>
    </main>
  );
}
