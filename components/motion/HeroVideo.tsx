"use client";

import { useEffect, useRef } from "react";

// Attaches the hero video after first paint, so it never competes with the poster.
// The poster <img> underneath is the LCP element; this only fades in on top of it.

const V = "v2";
const AV1_1080 = 'video/mp4; codecs="av01.0.08M.08"';
const AV1_PORTRAIT = 'video/mp4; codecs="av01.0.05M.08"';
const H264 = 'video/mp4; codecs="avc1.640028"';

export const PORTRAIT_QUERY = "(max-width: 767px) and (orientation: portrait)";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || (conn?.effectiveType && /2g/.test(conn.effectiveType))) return;

    const sources: [string, string][] = window.matchMedia(PORTRAIT_QUERY).matches
      ? [
          [`/video/hero-portrait-720.${V}.av1.mp4`, AV1_PORTRAIT],
          [`/video/hero-portrait-720.${V}.mp4`, H264],
        ]
      : window.innerWidth * Math.min(window.devicePixelRatio, 2) > 1500
        ? [
            [`/video/hero-1920.${V}.av1.mp4`, AV1_1080],
            [`/video/hero-1920.${V}.mp4`, H264],
          ]
        : [[`/video/hero-1280.${V}.mp4`, H264]];

    for (const [src, type] of sources) {
      const s = document.createElement("source");
      s.src = src;
      s.type = type;
      video.appendChild(s);
    }

    video.muted = true;
    const play = () => video.play().catch(() => {}); // refused autoplay (e.g. Low Power Mode): the poster stays
    const onPlaying = () => video.setAttribute("data-playing", "");
    video.addEventListener("playing", onPlaying, { once: true });
    video.load();
    play();

    // Pause while the page has scrolled over the hero, or the tab is hidden.
    let covered = false;
    const sync = () => (covered || document.hidden ? video.pause() : play());
    const end = document.getElementById("hero-end");
    const io = end
      ? new IntersectionObserver(([e]) => {
          covered = !e.isIntersecting && e.boundingClientRect.top < 0;
          sync();
        })
      : null;
    if (end && io) io.observe(end);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  return <video ref={ref} className="hero__video" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />;
}
