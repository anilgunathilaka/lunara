import { Input } from '@/components/primitives/Input';
import { setRequestLocale } from 'next-intl/server';

/**
 * Internal QA scratch page for the Input primitive (docs/3-components.md
 * §2.2). Not part of the shipped product surface — delete or gate behind
 * an env check before launch.
 */
export default async function InputQaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="mx-auto flex max-w-[420px] flex-col gap-8 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Input — QA
      </h1>

      <Input label="Full name" placeholder="e.g. Anushka Perera" />

      <Input label="Phone number" placeholder="07XXXXXXXX" defaultValue="0771234567" />

      <div className="flex flex-col gap-2">
        <p className="field-message" style={{ color: 'var(--lun-ink-muted)' }}>
          Focus this field, leave it empty, then blur — error only appears after blur, never
          per keystroke.
        </p>
        <Input
          label="Delivery address"
          required
          error="Enter your delivery address"
        />
      </div>

      <Input label="Disabled field" disabled defaultValue="Cannot edit" />
    </main>
  );
}
