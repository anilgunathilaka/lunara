'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Heart, LogOut, Package, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { authClient, useSession } from '@/lib/auth/auth-client';
import { clearFavourites } from '@/lib/favourites/store';

/** First letter of the name, else of the email: the avatar. */
function initialOf(name: string | undefined, email: string): string {
  const source = (name && name.trim()) || email;
  return source.trim().charAt(0).toUpperCase() || '?';
}

/**
 * The header's account icon (founder decision 2026-11-24). Signed out: a link
 * to sign in, as before. Signed in: a menu with the avatar, name and email
 * (to the profile), My orders, Favourites and Log out. Closes on Escape, on a
 * click elsewhere, or when a link is chosen.
 */
export function AccountMenu({ href, label, text }: { href: string; label: string; text?: string }) {
  const t = useTranslations('layout.accountMenu');
  const { data, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const user = data?.user;
  if (isPending || !user) {
    return (
      <Link href={href} className="site-header-cart focus-ring" aria-label={label}>
        <Icon icon={UserRound} />
        {text && <span className="site-header-account-text">{text}</span>}
      </Link>
    );
  }

  const initial = initialOf(user.name, user.email);
  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="account-menu">
      <button
        ref={buttonRef}
        type="button"
        className="account-menu-button focus-ring"
        aria-label={t('open')}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="account-avatar" aria-hidden="true">
          {initial}
        </span>
      </button>

      {open && (
        <div id={menuId} className="account-menu-panel">
          {/* The profile: through /account/start, so staff land in the operations panel. */}
          <Link href="/account/start" className="account-menu-who focus-ring" onClick={close}>
            <span className="account-avatar account-avatar-lg" aria-hidden="true">
              {initial}
            </span>
            <span className="account-menu-id">
              {user.name && user.name.trim() && user.name !== user.email && <strong>{user.name}</strong>}
              <span className="account-menu-email">{user.email}</span>
              <span className="account-menu-profile">{t('profile')}</span>
            </span>
          </Link>
          <ul className="account-menu-links">
            <li>
              <Link href="/account?tab=orders" className="account-menu-link focus-ring" onClick={close}>
                <Icon icon={Package} size="inline" />
                {t('myOrders')}
              </Link>
            </li>
            <li>
              <Link href="/account?tab=favourites" className="account-menu-link focus-ring" onClick={close}>
                <Icon icon={Heart} size="inline" />
                {t('favourites')}
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="account-menu-link focus-ring"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await authClient.signOut();
                  } finally {
                    // A shared device keeps no one's favourites after they log out.
                    clearFavourites();
                    setBusy(false);
                    close();
                    router.push('/');
                    router.refresh();
                  }
                }}
              >
                <Icon icon={LogOut} size="inline" />
                {t('signOut')}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
