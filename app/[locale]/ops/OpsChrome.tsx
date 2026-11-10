'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  Boxes,
  Calculator,
  Camera,
  Coins,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Star,
  Store,
  Tag,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';

type NavKey =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'office'
  | 'products'
  | 'stock'
  | 'prices'
  | 'costs'
  | 'photos'
  | 'messages'
  | 'reviews'
  | 'insights';

interface NavEntry {
  href: string;
  key: NavKey;
  icon: LucideIcon;
}

/** The panel's sections, grouped by the job they serve (docs/4-architecture.md §3.14). */
const GROUPS: { key: 'sales' | 'catalogue' | 'customers' | 'reports' | null; items: NavEntry[] }[] = [
  { key: null, items: [{ href: '/ops', key: 'overview', icon: LayoutDashboard }] },
  {
    key: 'sales',
    items: [
      { href: '/ops/orders', key: 'orders', icon: Package },
      { href: '/ops/payments', key: 'payments', icon: CreditCard },
      { href: '/ops/office', key: 'office', icon: Store },
    ],
  },
  {
    key: 'catalogue',
    items: [
      { href: '/ops/products', key: 'products', icon: Tag },
      { href: '/ops/stock', key: 'stock', icon: Boxes },
      { href: '/ops/prices', key: 'prices', icon: Coins },
      { href: '/ops/costs', key: 'costs', icon: Calculator },
      { href: '/ops/photos', key: 'photos', icon: Camera },
    ],
  },
  {
    key: 'customers',
    items: [
      { href: '/ops/messages', key: 'messages', icon: MessageSquare },
      { href: '/ops/reviews', key: 'reviews', icon: Star },
    ],
  },
  { key: 'reports', items: [{ href: '/ops/insights', key: 'insights', icon: BarChart3 }] },
];

const ALL = GROUPS.flatMap((g) => g.items);

function isCurrent(href: string, pathname: string): boolean {
  return href === '/ops' ? pathname === '/ops' : pathname === href || pathname.startsWith(`${href}/`);
}

export interface OpsShellProps {
  email: string;
  /** Counts that need someone, shown beside their section. */
  badges: Partial<Record<NavKey, number>>;
  children: ReactNode;
}

/**
 * The operations panel's own frame (docs/4-architecture.md §3.14): a plum
 * sidebar of grouped sections with what needs attention counted beside
 * them, and a top bar with the page's name, who is signed in, the store and
 * sign out. On phones the sidebar is a drawer behind a menu button.
 */
export function OpsShell({ email, badges, children }: OpsShellProps) {
  const t = useTranslations('ops');
  const tNav = useTranslations('ops.nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ALL.filter((item) => isCurrent(item.href, pathname)).pop() ?? ALL[0]!;

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={cn('ops-shell', open && 'is-open')}>
      <aside className="ops-sidebar" aria-label={t('title')}>
        <div className="ops-sidebar-head">
          <Link href="/ops" className="ops-brand focus-ring" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a small static mark */}
            <img src="/brand/lunara-emblem.webp" alt="" width={28} height={28} />
            <span>
              Lunara <small>{t('title')}</small>
            </span>
          </Link>
          <button type="button" className="ops-icon-button ops-drawer-close focus-ring" onClick={() => setOpen(false)} aria-label={t('closeMenu')}>
            <X className="icon" aria-hidden="true" />
          </button>
        </div>
        <nav className="ops-sidebar-nav">
          {GROUPS.map((group, g) => (
            <div key={g} className="ops-nav-group">
              {group.key && <p className="ops-nav-group-label">{t(`navGroup.${group.key}`)}</p>}
              {group.items.map(({ href, key, icon: ItemIcon }) => {
                const here = isCurrent(href, pathname);
                const badge = badges[key];
                return (
                  <Link
                    key={href}
                    href={href}
                    className="ops-side-link focus-ring"
                    aria-current={here ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <ItemIcon className="icon" aria-hidden="true" />
                    <span>{tNav(key)}</span>
                    {badge ? <span className="ops-badge">{badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="ops-sidebar-foot">
          <Link href="/" className="ops-side-link focus-ring">
            <ExternalLink className="icon" aria-hidden="true" />
            <span>{t('viewStore')}</span>
          </Link>
        </div>
      </aside>
      <button type="button" className="ops-scrim" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />

      <div className="ops-main">
        <header className="ops-topbar">
          <button type="button" className="ops-icon-button ops-drawer-open focus-ring" onClick={() => setOpen(true)} aria-label={t('openMenu')} aria-expanded={open}>
            <Menu className="icon" aria-hidden="true" />
          </button>
          <p className="ops-topbar-title">{tNav(current.key)}</p>
          <div className="ops-topbar-end">
            <span className="ops-topbar-user">{t('signedInAs', { email })}</span>
            <SignOutButton />
          </div>
        </header>
        <main id="main-content" className="ops-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export function SignOutButton() {
  const t = useTranslations('ops');
  const router = useRouter();
  return (
    <Button
      variant="tertiary"
      size="sm"
      onClick={async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
      }}
    >
      <LogOut className="icon icon-inline" aria-hidden="true" />
      {t('signOut')}
    </Button>
  );
}
