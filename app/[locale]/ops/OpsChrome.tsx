'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/primitives/Button';
import { authClient } from '@/lib/auth/auth-client';

const SECTIONS = [
  { href: '/ops', key: 'orders' },
  { href: '/ops/messages', key: 'messages' },
  { href: '/ops/payments', key: 'payments' },
  { href: '/ops/stock', key: 'stock' },
  { href: '/ops/prices', key: 'prices' },
  { href: '/ops/photos', key: 'photos' },
  { href: '/ops/reviews', key: 'reviews' },
] as const;

export function OpsNav() {
  const t = useTranslations('ops.nav');
  const pathname = usePathname();
  return (
    <nav className="ops-nav" aria-label={t('orders')}>
      {SECTIONS.map(({ href, key }) => {
        const current = href === '/ops' ? pathname === '/ops' || pathname.startsWith('/ops/orders') : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="ops-nav-link focus-ring" aria-current={current ? 'page' : undefined}>
            {t(key)}
          </Link>
        );
      })}
    </nav>
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
      {t('signOut')}
    </Button>
  );
}
