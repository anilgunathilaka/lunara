import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Button, type ButtonVariant } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';

/**
 * Internal QA scratch page for the Button primitive (docs/3-components.md
 * §2.1). Not part of the shipped product surface — delete or gate behind
 * an env check before launch.
 */

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger'];

export default function ButtonQaPage() {
  return (
    <main className="mx-auto flex max-w-[960px] flex-col gap-8 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Button — QA
      </h1>

      {VARIANTS.map((variant) => (
        <section key={variant} className="flex flex-col gap-3">
          <h2
            className="text-body-s uppercase text-ink-muted"
            style={{ letterSpacing: 'var(--type-label-tracking)' }}
          >
            {variant}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant={variant} size="sm">
              Small
            </Button>
            <Button variant={variant} size="md">
              Medium
            </Button>
            <Button variant={variant} size="lg">
              Large
            </Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
            <Button variant={variant} loading>
              Loading label
            </Button>
            <Button variant={variant} iconLeft={<Icon icon={ShoppingCart} size="inline" />}>
              Add to cart
            </Button>
            <Button variant={variant} iconRight={<Icon icon={ArrowRight} size="inline" />}>
              Continue
            </Button>
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="text-body-s uppercase tracking-[var(--type-label-tracking)] text-ink-muted">
          Full width
        </h2>
        <Button fullWidth>Place order</Button>
      </section>
    </main>
  );
}
