"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-menu-open", "");
    return () => {
      document.documentElement.removeAttribute("data-menu-open");
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Zapri meni" : "Odpri meni"}
        onClick={() => setOpen((v) => !v)}
        className="grid h-[42px] w-[42px] place-items-center rounded-full"
      >
        <span className="relative block h-3 w-5">
          <span className={`absolute left-0 h-[2px] w-5 bg-current transition-transform duration-200 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 h-[2px] w-5 bg-current transition-transform duration-200 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
        </span>
      </button>
      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Meni"
          className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-40 flex flex-col gap-1 overflow-y-auto bg-ink px-5 pb-10 pt-6 text-white"
        >
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="t-headline border-b border-white/10 py-4">
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
