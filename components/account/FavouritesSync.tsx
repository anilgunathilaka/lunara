'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { syncFavouritesAction } from '@/lib/favourites/actions';
import { readFavourites, setFavouritesSignedIn, writeFavourites } from '@/lib/favourites/store';

/**
 * Once per sign-in, copies this browser's favourites to the account and takes
 * the account's full list back (founder decision 2026-11-24). Renders nothing.
 */
export function FavouritesSync() {
  const { data } = useSession();
  const userId = data?.user.id ?? null;
  const synced = useRef<string | null>(null);

  useEffect(() => {
    setFavouritesSignedIn(userId !== null);
    if (!userId || synced.current === userId) return;
    synced.current = userId;
    void syncFavouritesAction([...readFavourites()])
      .then((ids) => {
        if (ids) writeFavourites(ids);
      })
      .catch(() => undefined);
  }, [userId]);

  return null;
}
