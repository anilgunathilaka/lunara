import { Checkbox } from '@/components/primitives/Checkbox';

/**
 * Internal QA scratch page for the Checkbox primitive (docs/3-components.md
 * §2.2). Not part of the shipped product surface — delete or gate behind
 * an env check before launch.
 */
export default function CheckboxQaPage() {
  return (
    <main className="mx-auto flex max-w-[420px] flex-col gap-6 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Checkbox — QA
      </h1>

      <Checkbox label="Send me order updates by SMS" />
      <Checkbox label="Pre-checked example" defaultChecked />
      <Checkbox label="Disabled, unchecked" disabled />
      <Checkbox label="Disabled, checked" disabled defaultChecked />

      <div className="flex flex-col gap-2">
        <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
          Focus this row, leave it unchecked, then blur — error only appears after blur.
        </p>
        <Checkbox
          label="I understand this saree ships unstitched"
          required
          error="You must confirm this before continuing"
        />
      </div>
    </main>
  );
}
