'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
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
    focus?: 'center' | 'end';
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
  proof: { initials: string[]; text: string } | null;
}

export interface HeroShowcaseProps {
  /** Shown at once: the founder's banners (no database needed). */
  slides: HeroSlide[];
  /** Featured sarees and review proof, joined on when the database answers. */
  more?: Promise<HeroMore>;
  /** Where the vertical "scroll" cue points. */
  scrollTarget: string;
  labels: {
    region: string;
    previous: string;
    next: string;
    /** "{n} of {total}", already formatted per slide. */
    slideOf: string[];
    scroll: string;
  };
}

/** Distance a swipe must travel before it counts, as a share of the frame's width. */
const SWIPE_SHARE = 0.12;
/**
 * Home hero banner (docs/2-ui.md §7.2): banners and featured sarees, full
 * width, with round previous / next arrows at the bottom left and real
 * review proof at the bottom right. A slide changes by a wipe of the frame —
 * the photograph itself is never moved, scaled or tinted (§7.1).
 *
 * It advances on its own every --motion-hero-interval (the timer is a CSS
 * animation on an invisible element) and waits while the pointer is over it
 * or anything in it has focus. Using an arrow hands control to the customer:
 * it stops advancing on its own (WCAG 2.2.2). Under prefers-reduced-motion
 * nothing advances on its own.
 */
export function HeroShowcase({ slides: firstSlides, more, scrollTarget, labels }: HeroShowcaseProps) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  // Once the customer uses an arrow, the slides stop moving on their own.
  const [userStopped, setUserStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swipeFrom = useRef<number | null>(null);
  // The banners paint at once; featured sarees and review proof join the
  // end of the row when the database answers, without restarting it.
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
  const proof = extra?.proof ?? null;
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
    const target = (next + count) % count;
    if (target === active) return;
    setLeaving(active);
    setActive(target);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') swipeFrom.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (from === null) return;
    const travel = event.clientX - from;
    if (Math.abs(travel) > event.currentTarget.clientWidth * SWIPE_SHARE) go(active + (travel < 0 ? 1 : -1));
  }

  const autoplay = count > 1 && !reducedMotion && !userStopped;
  const step = (direction: 1 | -1) => {
    setUserStopped(true);
    go(active + direction);
  };

  return (
    <section className="hero-card" aria-roledescription="carousel" aria-label={labels.region}>
      <div
        className="hero-card-frame"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
      >
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.href + i}
              className={cn('hero-slide', isActive && 'is-active', i === leaving && 'is-leaving')}
              role="group"
              aria-roledescription="slide"
              aria-label={slideOf[i]}
              aria-hidden={!isActive}
              inert={!isActive}
              onTransitionEnd={(e) => {
                if (isActive && e.target === e.currentTarget) setLeaving(null);
              }}
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                priority={i === 0}
                unoptimized={slide.image.unoptimized}
                className={cn('hero-slide-image', slide.image.focus === 'end' && 'hero-slide-image-end')}
              />
            </div>
          );
        })}

        {/* The timer: an invisible CSS animation whose end advances the slide. */}
        {autoplay && <span key={active} className="hero-card-timer" aria-hidden="true" onAnimationEnd={() => go(active + 1)} />}

        <a href={scrollTarget} className="hero-card-scroll focus-ring hero-card-in">
          <span className="hero-card-scroll-line" aria-hidden="true" />
          <span className="hero-card-scroll-text">{labels.scroll}</span>
        </a>

        {count > 1 && (
          <div className="hero-card-arrows hero-card-in">
            <button type="button" className="hero-card-arrow focus-ring" onClick={() => step(-1)} aria-label={labels.previous}>
              <Icon icon={ArrowLeft} size="inline" />
            </button>
            <button type="button" className="hero-card-arrow focus-ring" onClick={() => step(1)} aria-label={labels.next}>
              <Icon icon={ArrowRight} size="inline" />
            </button>
          </div>
        )}

        {proof && (
          <div className="hero-card-proof hero-card-in">
            <span className="hero-card-avatars" aria-hidden="true">
              {proof.initials.map((initial, i) => (
                <span key={i} className="hero-card-avatar">
                  {initial}
                </span>
              ))}
            </span>
            <span className="hero-card-proof-text">{proof.text}</span>
          </div>
        )}
      </div>
    </section>
  );
}
