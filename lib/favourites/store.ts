'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { setFavouriteAction } from './actions';

/**
 * Favourite sarees (founder decision 2026-11-24). Anyone can heart a saree,
 * with no sign-in (account creation is offered after purchase, never
 * before — CLAUDE.md): the list lives in this browser. When the customer is
 * signed in, each change is also saved to their account (FavouritesSync
 * copies the browser's list up on sign-in), so the profile shows it on any
 * device. Browser storage can be missing or blocked; every access is
 * guarded and the heart simply does nothing lasting then.
 */

const KEY = 'lunara.favourites.v1';
const EVENT = 'lunara:favourites';
const EMPTY: readonly string[] = [];

let signedIn = false;
/** Set by FavouritesSync once the session is known. */
export function setFavouritesSignedIn(value: boolean): void {
  signedIn = value;
}

let cachedRaw: string | null = null;
let cachedIds: readonly string[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function snapshot(): readonly string[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedIds = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, 200) : EMPTY;
  } catch {
    cachedIds = EMPTY;
  }
  return cachedIds;
}

export function readFavourites(): readonly string[] {
  return snapshot();
}

export function writeFavourites(ids: readonly string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...new Set(ids)].slice(0, 200)));
  } catch {
    // Storage blocked: nothing to keep.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearFavourites(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing to clear.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useFavourites(): { ids: readonly string[]; has: (id: string) => boolean; toggle: (id: string) => boolean } {
  const ids = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const current = snapshot();
    const on = !current.includes(id);
    writeFavourites(on ? [id, ...current] : current.filter((v) => v !== id));
    // Saved to the account as well when signed in; the browser copy stands if this fails.
    if (signedIn) void setFavouriteAction(id, on).catch(() => undefined);
    return on;
  }, []);
  return { ids, has, toggle };
}
