'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFavourites } from '@/lib/favourites/store';
import { cn } from '@/lib/utils';

/**
 * The heart on a saree (founder decision 2026-11-24). Works for everyone with
 * no sign-in; its state is announced by aria-pressed, and the label says what
 * a press will do. Filled plum when saved.
 */
export function FavouriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const t = useTranslations('favourites');
  const { has, toggle } = useFavourites();
  const on = has(listingId);
  return (
    <button
      type="button"
      className={cn('favourite-button focus-ring', on && 'is-on', className)}
      aria-pressed={on}
      aria-label={on ? t('remove') : t('add')}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(listingId);
      }}
    >
      <Heart className="icon" aria-hidden="true" fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}
