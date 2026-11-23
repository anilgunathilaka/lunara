'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Icon } from '@/components/primitives/Icon';

export interface HomeFilmProps {
  src: string;
  poster: string;
  labels: { pause: string; play: string };
}

/**
 * A short silent film of a saree being worn (founder decision 2026-11-23),
 * shown in the home page's two-drapes stage in place of its photograph. It
 * fills its positioned parent. Product imagery: no overlay, tint or words on
 * it, only its pause button.
 *
 * Mobile data first: the file is fetched only as it nears the screen
 * (preload="none" until then), plays only while on screen, and loops
 * muted. Under prefers-reduced-motion it never starts by itself; the poster
 * shows and the button plays it. The button pauses it at any time (WCAG
 * 2.2.2: moving content longer than five seconds can be paused).
 */
export function HomeFilm({ src, poster, labels }: HomeFilmProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Set once the viewer pauses or plays by hand: scrolling never overrides it.
  const chosen = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (chosen.current || !entry) return;
        if (entry.isIntersecting) {
          video.preload = 'auto';
          void video.play().catch(() => setPlaying(false));
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    chosen.current = true;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  return (
    <>
      <video
        ref={ref}
        className="home-film-video"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="home-film-toggle focus-ring"
        onClick={toggle}
        aria-label={playing ? labels.pause : labels.play}
      >
        <Icon icon={playing ? Pause : Play} size="inline" />
      </button>
    </>
  );
}
