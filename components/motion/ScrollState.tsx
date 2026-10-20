"use client";

import { useEffect } from "react";

// Marks the document once the page content has scrolled up to the navigation,
// so the nav can turn solid. One IntersectionObserver, no scroll listener.
export function ScrollState() {
  useEffect(() => {
    const end = document.getElementById("hero-end");
    const root = document.documentElement;
    if (!end) {
      root.setAttribute("data-past-hero", "");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => root.toggleAttribute("data-past-hero", !e.isIntersecting && e.boundingClientRect.top < window.innerHeight / 2),
      { rootMargin: "-68px 0px 0px 0px" },
    );
    io.observe(end);
    return () => {
      io.disconnect();
      root.removeAttribute("data-past-hero");
    };
  }, []);
  return null;
}
