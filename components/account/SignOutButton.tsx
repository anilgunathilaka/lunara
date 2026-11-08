'use client';

import { useState } from 'react';
import { Button } from '@/components/primitives/Button';
import { useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth/auth-client';

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="tertiary"
      loading={busy}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await authClient.signOut();
        } finally {
          router.push('/');
          router.refresh();
        }
      }}
    >
      {label}
    </Button>
  );
}
