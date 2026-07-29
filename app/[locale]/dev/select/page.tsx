import { Select } from '@/components/primitives/Select';

/**
 * Internal QA scratch page for the Select primitive (docs/3-components.md
 * §2.2). Not part of the shipped product surface — delete or gate behind
 * an env check before launch.
 */
export default function SelectQaPage() {
  return (
    <main className="mx-auto flex max-w-[420px] flex-col gap-8 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Select — QA
      </h1>

      <Select
        label="Material"
        placeholder="Choose a material"
        options={[
          { value: 'plain', label: 'Plain Cotton' },
          { value: 'super', label: 'Super Cotton' },
        ]}
      />

      <Select
        label="Jacket colour"
        defaultValue="gold"
        options={[
          { value: 'plum', label: 'Plum' },
          { value: 'gold', label: 'Gold' },
          { value: 'ivory', label: 'Ivory', disabled: true },
        ]}
      />

      <div className="flex flex-col gap-2">
        <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
          Focus this field, leave it on the placeholder, then blur — error only appears after
          blur.
        </p>
        <Select
          label="Delivery district"
          required
          placeholder="Choose a district"
          error="Choose a delivery district"
          options={[
            { value: 'colombo', label: 'Colombo' },
            { value: 'kandy', label: 'Kandy' },
          ]}
        />
      </div>

      <Select
        label="Disabled field"
        disabled
        defaultValue="plum"
        options={[{ value: 'plum', label: 'Plum' }]}
      />
    </main>
  );
}
