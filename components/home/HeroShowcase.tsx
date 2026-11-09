'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/primitives/Icon';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  href: string;
  image: { src: string; alt: string };
  title: string;
  /** Short line after the title, e.g. the cotton. */
  caption?: string;
}

export interface HeroShowcaseProps {
  slides: HeroSlide[];
  /** Facts as pills at the bottom left, each linking to where it is explained. */
  pills: { label: string; href: string }[];
  /** Top right: a way to reach us. */
  contact: { label: string; href: string };
  /** Bottom right: real review proof, or nothing. */
  proof: { initials: string[]; text: string } | null;
  /** Where the vertical "scroll" cue points. */
  scrollTarget: string;
  labels: {
    region: string;
    pause: string;
    play: string;
    /** "{n} of {total}", already formatted per slide. */
    slideOf: string[];
    scroll: string;
  };
}

/** Distance a swipe must travel before it counts, as a share of the frame's width. */
const SWIPE_SHARE = 0.12;
/** Characters the decoding line cycles through before settling. */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
/** Animation frames each character takes to settle, and the extra per position. */
const DECODE_FRAMES = 10;
const DECODE_STAGGER = 1;

/** Text that "decodes" into place, character by character (docs/2-ui.md §7.2). */
function useDecoded(text: string, enabled: boolean): string {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let handle = 0;
    const total = DECODE_FRAMES + text.length * DECODE_STAGGER;
    const step = () => {
      frame += 1;
      setShown(
        [...text]
          .map((ch, i) => {
            if (ch === ' ' || frame >= DECODE_FRAMES + i * DECODE_STAGGER) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(''),
      );
      if (frame < total) handle = requestAnimationFrame(step);
    };
    handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [text, enabled]);
  return enabled ? shown : text;
}

/**
 * Home hero card (docs/2-ui.md §7.2): featured sarees in one rounded frame,
 * with the current saree's name decoding at the top left, a way to reach us
 * at the top right, facts as pills at the bottom left and real review proof
 * at the bottom right. A slide changes by a wipe of the frame — the
 * photograph itself is never moved, scaled or tinted (§7.1). The timer is a
 * CSS animation on an invisible element, so pausing (button, hover, focus)
 * pauses it, and under prefers-reduced-motion nothing advances on its own.
 */
export function HeroShowcase({ slides, pills, contact, proof, scrollTarget, labels }: HeroShowcaseProps) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swipeFrom = useRef<number | null>(null);
  const count = slides.length;
  const current = slides[active]!;
  const decoded = useDecoded(current.caption ? `${current.title} · ${current.caption}` : current.title, !reducedMotion);

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
              aria-label={labels.slideOf[i]}
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
                className="hero-slide-image"
              />
            </div>
          );
        })}

        {/* The timer: an invisible CSS animation whose end advances the slide. */}
        {autoplay && <span key={active} className="hero-card-timer" aria-hidden="true" onAnimationEnd={() => go(active + 1)} />}

        <div className="hero-card-corner hero-card-top-start hero-card-in">
          {count > 1 && !reducedMotion && (
            <button
              type="button"
              className="hero-card-pause focus-ring"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? labels.play : labels.pause}
            >
              <Icon icon={userPaused ? Play : Pause} size="inline" />
            </button>
          )}
          <Link href={current.href} className="hero-card-meta focus-ring" aria-live="polite">
            <span aria-hidden="true">{decoded}</span>
            <span className="sr-only">{current.caption ? `${current.title} · ${current.caption}` : current.title}</span>
          </Link>
          {count > 1 && (
            <span className="hero-card-count" aria-hidden="true">
              {String(active + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}
            </span>
          )}
        </div>

        <a href={contact.href} target="_blank" rel="noopener noreferrer" className="hero-card-corner hero-card-top-end hero-card-meta hero-card-in focus-ring">
          {contact.label}
        </a>

        <a href={scrollTarget} className="hero-card-scroll focus-ring hero-card-in">
          <span className="hero-card-scroll-line" aria-hidden="true" />
          <span className="hero-card-scroll-text">{labels.scroll}</span>
        </a>

        <ul className="hero-card-pills">
          {pills.map((pill, i) => (
            <li key={pill.href + i} className="hero-card-in" style={{ '--i': i } as CSSProperties}>
              <Link href={pill.href} className="hero-pill focus-ring">
                {pill.label}
                <Icon icon={ArrowUpRight} size="inline" />
              </Link>
            </li>
          ))}
        </ul>

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
