'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { subscribeAction, type SubscribeState } from '@/lib/subscribe/actions';

/**
 * Subscribe band after the footer (founder decision 2026-11-24; layout after
 * developeroffice.com): a large centred heading, email and mobile side by
 * side, one button. Either field is enough. The result is said in place,
 * never as a toast, and the rest of the page never depends on it.
 *
 * Motion, as on the reference: the band is pinned beneath the footer, which
 * scrolls up and away to reveal it, and the text drifts up by --motion-drift
 * as the band arrives, settling once it fills the screen. Off under
 * prefers-reduced-motion, where the band is an ordinary section.
 */
export function SubscribeForm() {
  const t = useTranslations('layout.subscribe');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(subscribeAction, { status: 'idle' });
  const pinRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const copy = copyRef.current;
    if (!pin || !copy) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduce.matches) {
        copy.style.transform = '';
        return;
      }
      // 1 while the band is a screen or more below, 0 once it reaches the top.
      const progress = Math.min(1, Math.max(0, pin.getBoundingClientRect().top / window.innerHeight));
      copy.style.transform = progress > 0 ? `translate3d(0, calc(var(--motion-drift) * ${progress.toFixed(4)}), 0)` : '';
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduce.addEventListener('change', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', schedule);
    };
  }, []);

  const error =
    state.status === 'invalid'
      ? t(state.field === 'email' ? 'errorEmail' : state.field === 'phone' ? 'errorPhone' : 'errorNone')
      : state.status === 'error'
        ? t('errorServer')
        : null;
  const emailInvalid = state.status === 'invalid' && state.field !== 'phone';
  const phoneInvalid = state.status === 'invalid' && state.field !== 'email';

  return (
    <div ref={pinRef} className="site-subscribe-pin">
    <section className="site-subscribe" aria-labelledby="site-subscribe-heading">
      <div ref={copyRef} className="site-subscribe-inner">
        <h2 id="site-subscribe-heading" className="site-subscribe-heading">
          {t('heading')}
        </h2>
        <p className="site-subscribe-sub">{t('sub')}</p>

        {state.status === 'done' ? (
          <p className="site-subscribe-done" role="status">
            {t('done')}
          </p>
        ) : (
          <form action={formAction} className="site-subscribe-form" noValidate>
            <input type="hidden" name="locale" value={locale} />
            {/* Honeypot: hidden from people and screen readers; bots fill it. */}
            <div className="site-subscribe-trap" aria-hidden="true">
              <label htmlFor="subscribe-website">{t('trap')}</label>
              <input id="subscribe-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="site-subscribe-fields">
              <label htmlFor="subscribe-email" className="sr-only">
                {t('emailLabel')}
              </label>
              <input
                id="subscribe-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('emailLabel')}
                maxLength={200}
                className={cn('input', emailInvalid && 'field-invalid')}
                aria-invalid={emailInvalid || undefined}
                aria-describedby={error ? 'subscribe-error' : undefined}
              />
              <label htmlFor="subscribe-phone" className="sr-only">
                {t('phoneLabel')}
              </label>
              <input
                id="subscribe-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t('phonePlaceholder')}
                maxLength={20}
                className={cn('input', phoneInvalid && 'field-invalid')}
                aria-invalid={phoneInvalid || undefined}
                aria-describedby={error ? 'subscribe-error' : undefined}
              />
            </div>

            <p id="subscribe-error" className="site-subscribe-error" role="alert">
              {error}
            </p>

            <button type="submit" className="solid-pill focus-ring" disabled={pending}>
              {pending ? t('sending') : t('submit')}
            </button>

            <p className="site-subscribe-fine">
              {t.rich('fine', {
                link: (chunks) => (
                  <Link href="/policies/privacy" className="site-subscribe-fine-link focus-ring">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </form>
        )}
      </div>
    </section>
    </div>
  );
}
