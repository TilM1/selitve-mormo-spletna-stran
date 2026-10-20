"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Marks <html data-past-hero> once the hero has scrolled away, so the nav turns solid and the
// mobile call bar slides in. One IntersectionObserver, no scroll listener.
export function ScrollState() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const end = document.getElementById("hero-end");
    if (!end) {
      root.setAttribute("data-past-hero", "");
      return;
    }
    root.removeAttribute("data-past-hero");
    const io = new IntersectionObserver(
      ([e]) => root.toggleAttribute("data-past-hero", !e.isIntersecting && e.boundingClientRect.top < window.innerHeight / 2),
      { rootMargin: "-68px 0px 0px 0px" },
    );
    io.observe(end);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
