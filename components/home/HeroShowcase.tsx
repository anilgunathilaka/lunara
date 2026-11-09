'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  href: string;
  image: { src: string; alt: string };
  title: string;
  /** Short line under the title, e.g. the cotton. */
  caption?: string;
}

export interface HeroShowcaseProps {
  slides: HeroSlide[];
  labels: {
    /** Accessible name of the whole showcase. */
    region: string;
    previous: string;
    next: string;
    pause: string;
    play: string;
    /** "Slide {n} of {total}", already formatted per slide. */
    slideOf: string[];
    view: string;
  };
}

/** Distance a swipe must travel before it counts, as a share of the frame's width. */
const SWIPE_SHARE = 0.12;

/**
 * Home hero showcase (docs/2-ui.md §7.2). Featured sarees in one wide
 * frame. A slide changes by a wipe of the frame: the photograph itself is
 * never moved or scaled (§7.1). Timing lives in CSS tokens — the gold
 * progress line's animation ending is what advances the slide — so pausing
 * (button, hover, focus) is just pausing that animation, and under
 * prefers-reduced-motion nothing advances on its own.
 */
export function HeroShowcase({ slides, labels }: HeroShowcaseProps) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swipeFrom = useRef<number | null>(null);
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

  const autoplay = count > 1 && !reducedMotion && !userPaused;

  return (
    <section className="hero-showcase" aria-roledescription="carousel" aria-label={labels.region}>
      <div className="hero-showcase-frame" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipeFrom.current = null)}>
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.href + i}
              className={cn('hero-slide', isActive && 'is-active', i === leaving && 'is-leaving')}
              role="group"
              aria-roledescription="slide"
              aria-label={labels.slideOf[i]}
              aria-hidden={!isActive}
              inert={!isActive}
              onTransitionEnd={(e) => {
                if (isActive && e.target === e.currentTarget) setLeaving(null);
              }}
            >
              <Image src={slide.image.src} alt={slide.image.alt} fill sizes="100vw" priority={i === 0} className="hero-slide-image" />
              <div className="hero-slide-plate">
                <span className="hero-mask">
                  <span className="hero-slide-title">{slide.title}</span>
                </span>
                <Link href={slide.href} className="hero-slide-link focus-ring">
                  <span>{slide.caption ? `${slide.caption} · ${labels.view}` : labels.view}</span>
                  <span className="hero-slide-arrow" aria-hidden="true">
                    <Icon icon={ArrowRight} size="inline" />
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="hero-showcase-controls">
          <span className="hero-showcase-count" aria-hidden="true">
            {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <span className="hero-showcase-progress" aria-hidden="true">
            {autoplay && <span key={active} className="hero-showcase-progress-bar" onAnimationEnd={() => go(active + 1)} />}
          </span>
          <button type="button" className="hero-showcase-button focus-ring" onClick={() => go(active - 1)} aria-label={labels.previous}>
            <Icon icon={ArrowLeft} />
          </button>
          <button type="button" className="hero-showcase-button focus-ring" onClick={() => go(active + 1)} aria-label={labels.next}>
            <Icon icon={ArrowRight} />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              className="hero-showcase-button focus-ring"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? labels.play : labels.pause}
            >
              <Icon icon={userPaused ? Play : Pause} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
