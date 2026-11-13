'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  href: string;
  image: {
    src: string;
    alt: string;
    /** Where the subject sits, so a narrow crop keeps it in frame. */
    focus?: 'start' | 'center' | 'end';
    /** Already sized and compressed (a founder banner on R2): skip the optimiser. */
    unoptimized?: boolean;
  };
  title: string;
  /** Short line after the title, e.g. the cotton. */
  caption?: string;
}

/** Slides that need the database, streamed in after the page has painted. */
export interface HeroMore {
  slides: HeroSlide[];
  /** "{n} of {total}" for every slide, the first ones included. */
  slideOf: string[];
}

export interface HeroShowcaseProps {
  /** Shown at once: the founder's banners (no database needed). */
  slides: HeroSlide[];
  /** Featured sarees, joined on when the database answers. */
  more?: Promise<HeroMore>;
  labels: {
    region: string;
    previous: string;
    next: string;
    /** "{n} of {total}", already formatted per slide. */
    slideOf: string[];
  };
}

/** Distance a swipe must travel before it counts, as a share of the frame's width. */
const SWIPE_SHARE = 0.12;

/**
 * Home hero banner (docs/2-ui.md §7.2; founder decision 2026-11-10, after
 * secchiariboots.com): photographs only, no words on them. The slides sit
 * side by side and the row slides across (--motion-hero-slide); each
 * photograph is inset from the page edges. Thin arrows sit at the bottom
 * right (no dashes: founder decision 2026-11-13); phones swipe. No parallax
 * and no dimming of the neighbouring slides: a photograph is never tinted
 * or drifted (§7.1).
 *
 * It advances on its own every --motion-hero-interval (the timer is a CSS
 * animation on an invisible element) and waits while the pointer is over it
 * or anything in it has focus. Using an arrow or a swipe hands control to the
 * customer: it stops advancing on its own (WCAG 2.2.2). Under
 * prefers-reduced-motion nothing advances on its own and slides change at once.
 */
export function HeroShowcase({ slides: firstSlides, more, labels }: HeroShowcaseProps) {
  const [active, setActive] = useState(0);
  // Once the customer uses an arrow or swipes, the slides stop moving on their own.
  const [userStopped, setUserStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swipeFrom = useRef<number | null>(null);
  // The banners paint at once; featured sarees join the end of the row when
  // the database answers, without restarting it.
  const [extra, setExtra] = useState<HeroMore | null>(null);
  useEffect(() => {
    let live = true;
    if (!more) return;
    // The server streams a React thenable, whose then() returns nothing: wrap it in a real promise.
    Promise.resolve(more)
      .then((value) => {
        if (live) setExtra(value);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [more]);
  const slides = extra ? [...firstSlides, ...extra.slides] : firstSlides;
  const slideOf = extra ? extra.slideOf : labels.slideOf;
  const count = slides.length;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  function go(next: number) {
    if (count < 2) return;
    setActive((next + count) % count);
  }
  function choose(next: number) {
    setUserStopped(true);
    go(next);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') swipeFrom.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (from === null) return;
    const travel = event.clientX - from;
    if (Math.abs(travel) > event.currentTarget.clientWidth * SWIPE_SHARE) choose(active + (travel < 0 ? 1 : -1));
  }

  const autoplay = count > 1 && !reducedMotion && !userStopped;

  return (
    <section className="hero-card" aria-roledescription="carousel" aria-label={labels.region}>
      <div
        className="hero-card-frame"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
      >
        <div className="hero-track" style={{ '--hero-active': active } as CSSProperties}>
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <div
                key={slide.href + i}
                className={cn('hero-slide', isActive && 'is-active')}
                role="group"
                aria-roledescription="slide"
                aria-label={slideOf[i]}
                aria-hidden={!isActive}
                inert={!isActive}
              >
                <div className="hero-slide-media">
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt}
                    fill
                    sizes="100vw"
                    priority={i === 0}
                    // Off-screen slides would wait to load until they slide into view: fetch all (four at most).
                    loading={i === 0 ? undefined : 'eager'}
                    unoptimized={slide.image.unoptimized}
                    className={cn(
                      'hero-slide-image',
                      slide.image.focus === 'end' && 'hero-slide-image-end',
                      slide.image.focus === 'start' && 'hero-slide-image-start',
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* The timer: an invisible CSS animation whose end advances the slide. */}
        {autoplay && <span key={active} className="hero-card-timer" aria-hidden="true" onAnimationEnd={() => go(active + 1)} />}

        {count > 1 && (
          <>
            <div className="hero-card-arrows">
              <button type="button" className="hero-card-arrow focus-ring" onClick={() => choose(active - 1)} aria-label={labels.previous}>
                <Icon icon={ArrowLeft} size="inline" />
              </button>
              <button type="button" className="hero-card-arrow focus-ring" onClick={() => choose(active + 1)} aria-label={labels.next}>
                <Icon icon={ArrowRight} size="inline" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
