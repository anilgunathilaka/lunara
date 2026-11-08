import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { Divider } from '@/components/primitives/Divider';
import { SectionMarker } from '@/components/brand/SectionMarker';
import { MotifDivider } from '@/components/brand/MotifDivider';
import { setRequestLocale } from 'next-intl/server';

/**
 * Internal QA scratch page for Icon, Divider, SectionMarker and
 * MotifDivider (docs/3-components.md §2.3, docs/2-ui.md §6.3). Not part
 * of the shipped product surface — delete or gate behind an env check
 * before launch.
 */
export default async function BrandQaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="mx-auto flex max-w-[420px] flex-col gap-8 p-6">
      <h1 className="text-heading text-ink" style={{ fontWeight: 'var(--type-heading-weight)' }}>
        Brand primitives — QA
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">Icon — inline / default / touch, colour inherits</h2>
        <div className="flex items-center gap-4 text-ink">
          <Icon icon={ShoppingCart} size="inline" />
          <Icon icon={ShoppingCart} size="default" />
          <Icon icon={ShoppingCart} size="touch" />
          <span className="text-gold">
            <Icon icon={Star} size="default" />
          </span>
          <Icon icon={Heart} size="default" label="Save this design" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">Divider</h2>
        <Divider />
        <Divider tone="gold" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">SectionMarker</h2>
        <div>
          <SectionMarker />
          <h3 className="text-heading text-ink">Curated for you</h3>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="field-label">MotifDivider</h2>
        <MotifDivider />
      </section>
    </main>
  );
}
