"use client";

import { useEffect } from "react";

// Behaviour for the hero <video> (see HERO_VIDEO_PROMPT §4).
// The <video> markup itself lives in Hero.tsx.



type Conn = { saveData?: boolean; effectiveType?: string };

export function HeroVideoController() {
  useEffect(() => {
    const v = document.querySelector<HTMLVideoElement>(".hero__video");
    if (!v) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: Conn }).connection;
    const saveData = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || "");
    if (reduce || saveData) {
      v.removeAttribute("autoplay");
      v.pause();
      v.preload = "none";
      v.style.display = "none";
      return;
    }
    v.muted = true;
    // A touch slower than recorded; the loop stays seamless.
    v.defaultPlaybackRate = 0.8;
    v.playbackRate = 0.8;
    const play = () => v.play().catch(() => {}); // blocked (e.g. iOS Low Power Mode): the poster stays
    // Pause when the hero is off-screen or the tab is hidden, resume when back.
    let visible = true;
    const sync = () => (visible && !document.hidden ? play() : v.pause());
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    play();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return null;
}
